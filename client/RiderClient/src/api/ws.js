import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { refreshToken } from "./auth"; // your Axios instance

let stompClient = null;
let reconnectTimeout = null;
let isRefreshing = false;
let isActivating = false;
let isDeactivating = false;

// Centralized subscription management
// Active subscriptions per destination for the current client
// destination -> Set<{ stompSub, callback }>
const subscriptionRegistry = new Map();
// Pending subscriptions queued while disconnected; supports multiples per destination
// destination -> Set<callback>
const pendingSubscriptions = new Map();
const adhocQueue = new Set(); // legacy queue of callbacks expecting client

export const connectSocket = async (onConnect) => {
    return new Promise((resolve, reject) => {
        try {
            // Avoid parallel activations or multiple clients
            if (isActivating) {
                console.log("⏳ WS activation already in progress");
                return;
            }

            // If an existing client is present, ensure it's fully deactivated
            if (stompClient) {
                try {
                    isDeactivating = true;
                    stompClient.deactivate();
                } catch (e) {
                    console.warn("⚠️ Error deactivating existing client:", e);
                }
                stompClient = null;
            }

            isActivating = true;

            const socket = new SockJS("http://localhost:8080/ws", null, {
                withCredentials: true,
            });

            stompClient = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 0, // We handle reconnect manually
                debug: (str) => console.log("STOMP:", str),
                onConnect: () => {
                    console.log("✅ WebSocket connected");

                    // Flush pending subscriptions once per destination and callback
                    for (const [destination, callbacks] of pendingSubscriptions.entries()) {
                        for (const cb of callbacks) {
                            try {
                                const stompSub = stompClient.subscribe(destination, (message) => {
                                    try { cb(message); } catch (e) { console.error("❌ Subscriber error:", e); }
                                });
                                const set = subscriptionRegistry.get(destination) || new Set();
                                set.add({ stompSub, callback: cb });
                                subscriptionRegistry.set(destination, set);
                            } catch (err) {
                                console.error("❌ Error subscribing to", destination, err);
                            }
                        }
                    }
                    pendingSubscriptions.clear();

                    // Flush legacy adhoc queue callbacks
                    for (const cb of adhocQueue) {
                        try { cb(stompClient); } catch (err) { console.error("❌ Error in queued callback:", err); }
                    }
                    adhocQueue.clear();

                    isActivating = false;
                    onConnect && onConnect(stompClient);
                    resolve(stompClient);
                },
                onStompError: (frame) => {
                    isActivating = false;
                    const msg = frame.headers?.["message"] || "";
                    console.error("❌ Broker error:", msg);
                    // If auth-related, try refresh; otherwise just reconnect
                    if (/401|403/i.test(msg)) {
                        handleRefreshAndReconnect(onConnect);
                    } else {
                        scheduleReconnect(onConnect);
                    }
                },
                onWebSocketClose: (evt) => {
                    isActivating = false;
                    // Ignore close events we triggered by deactivate
                    if (isDeactivating) {
                        isDeactivating = false;
                        return;
                    }
                    console.warn("WebSocket closed", evt);
                    scheduleReconnect(onConnect);
                },
                onWebSocketError: (error) => {
                    isActivating = false;
                    // Ignore error events we triggered by deactivate
                    if (isDeactivating) {
                        isDeactivating = false;
                        return;
                    }
                    console.error("❌ WebSocket error:", error);
                    scheduleReconnect(onConnect);
                },
            });

            stompClient.activate();
        } catch (e) {
            isActivating = false;
            console.error("WS connection failed:", e);
            reject(e);
            scheduleReconnect(onConnect);
        }
    });
};

const scheduleReconnect = (onConnect) => {
    if (reconnectTimeout) return;

    reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        console.log("🔄 Reconnecting WebSocket...");
        connectSocket(onConnect);
    }, 3000);
};

const handleRefreshAndReconnect = async (onConnect) => {
    try {
        isRefreshing = true;
        const success = await refreshToken();
        isRefreshing = false;

        if (success) {
            console.log("✅ Token refreshed, reconnecting WS...");
            scheduleReconnect(onConnect);
        } else {
            console.error("❌ Refresh failed → logging out");
            disconnectSocket();
            window.location.href = "/login";
        }
    } catch (err) {
        isRefreshing = false;
        console.error("❌ Refresh failed:", err);
        disconnectSocket();
        window.location.href = "/login";
    }
};

// Subscribe to a destination once; dedup both when connected and disconnected
export const subscribeTopic = (destination, callback) => {
    // Helper to add to registry
    const addActive = (stompSub) => {
        const set = subscriptionRegistry.get(destination) || new Set();
        const record = { stompSub, callback };
        set.add(record);
        subscriptionRegistry.set(destination, set);
        return record;
    };

    // Helper to remove a specific record
    const removeRecord = (record) => {
        const set = subscriptionRegistry.get(destination);
        if (set) {
            set.delete(record);
            if (set.size === 0) subscriptionRegistry.delete(destination);
        }
        const pend = pendingSubscriptions.get(destination);
        if (pend) {
            pend.delete(callback);
            if (pend.size === 0) pendingSubscriptions.delete(destination);
        }
    };

    // Subscribe now if connected
    let record = null;
    if (stompClient && stompClient.connected) {
        const stompSub = stompClient.subscribe(destination, (message) => {
            try { callback(message); } catch (e) { console.error("❌ Subscriber error:", e); }
        });
        record = addActive(stompSub);
    } else {
        // Queue for later: store callback in a Set per destination
        const set = pendingSubscriptions.get(destination) || new Set();
        set.add(callback);
        pendingSubscriptions.set(destination, set);
    }

    // Return handle to unsubscribe only this subscription
    return {
        unsubscribe: () => {
            if (record && record.stompSub && typeof record.stompSub.unsubscribe === 'function') {
                try { record.stompSub.unsubscribe(); } catch (e) { console.warn("⚠️ Unsubscribe error:", e); }
            }
            removeRecord(record || { callback });
        },
    };
};

// Legacy API: Queue a function that will receive the client when connected
export const subscribeSafe = (callback) => {
    if (stompClient && stompClient.connected) {
        callback(stompClient);
        return;
    }
    adhocQueue.add(callback);
};

export const disconnectSocket = () => {
    // Unsubscribe all active subscriptions
    for (const [, set] of subscriptionRegistry.entries()) {
        for (const rec of set) {
            try { rec?.stompSub?.unsubscribe?.(); } catch (e) { console.warn("⚠️ Error during unsubscribe:", e); }
        }
    }
    subscriptionRegistry.clear();
    pendingSubscriptions.clear();

    try {
        stompClient?.deactivate();
    } catch (e) {
        console.warn("⚠️ Error during client deactivation:", e);
    }
    stompClient = null;

    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }
};

export const getClient = () => stompClient;
