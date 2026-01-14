// lightweight WebSocket/STOMP wrapper for order status updates
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
// Build WS URL from REACT_APP_CUSTOMER_URL. If the API URL contains '/api', strip it.
const buildWsUrl = () => {
  try {
    console.log('Building WebSocket URL from REACT_APP_CUSTOMER_URL', process.env.REACT_APP_CUSTOMER_URL);
    const base = (process.env.REACT_APP_CUSTOMER_URL || '').replace(/\/api\/?$/i, '');
    // ensure no trailing slash
    return (base.replace(/\/$/, '') || '') + '/ws';
  } catch (e) {
    return '/ws';
  }
};
let client = null;
let connected = false;
let subscriptions = [];
let orderSubscriptions = new Map(); // Track order-specific subscriptions
let riderLocationSubscriptions = new Map(); // Track rider location subscriptions
let globalOnMessage = null; // Store the global message handler
let pendingOrderIds = []; // Store order IDs to subscribe once connected
let globalOnConnect = null;
let globalOnDisconnect = null;
// Initialize the socket connection and subscribe to general topics
export const initOrderSocket = (orderIds, onMessage, onConnectCallback, onDisconnectCallback) => {
  // Store the message handler globally
  if (onMessage) {
    globalOnMessage = onMessage;
  }
  // Store callbacks
  if (onConnectCallback) {
    globalOnConnect = onConnectCallback;
  }
  if (onDisconnectCallback) {
    globalOnDisconnect = onDisconnectCallback;
  }
  // If already connected, just update order subscriptions
  if (client && connected) {
    console.log('Socket already connected, updating subscriptions');
    updateOrderSubscriptions(orderIds, onMessage || globalOnMessage);
    return client;
  }
  // If client exists and is connecting, store order IDs for later
  if (client && !connected) {
    console.log('Socket connecting... will subscribe when ready');
    if (orderIds) {
      const orderIdArray = Array.isArray(orderIds) ? orderIds : [orderIds];
      pendingOrderIds = [...new Set([...pendingOrderIds, ...orderIdArray])];
    }
    return client;
  }
  const wsUrl = buildWsUrl();
  console.log('Connecting to WebSocket:', wsUrl);
  client = new Client({
    // use SockJS factory so it works with the Spring SockJS endpoint
    webSocketFactory: () => new SockJS(wsUrl),
    reconnectDelay: 5000,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 20000,
    debug: (str) => {
      // Log ALL STOMP frames to see what's coming from backend
      if (str.includes('MESSAGE') || str.includes('SEND') || str.includes('destination')) {
        console.log('[STOMP FRAME]', str);
      }
    }
  });
  client.onConnect = (frame) => {
    connected = true;
    console.log('✅ WebSocket connected successfully');
    try {
      // Subscribe to general order status updates
      const sub1 = client.subscribe('/topic/order-status', (msg) => {
        console.log('📩 Message on /topic/order-status:', msg.body);
        if (msg.body) {
          safeCallOnMessage(msg.body, globalOnMessage);
        }
      });
      subscriptions.push(sub1);
      console.log('✓ Subscribed to /topic/order-status');
      // Subscribe to user-specific queue
      const sub2 = client.subscribe('/user/queue/orders', (msg) => {
        console.log('📩 Message on /user/queue/orders:', msg.body);
        if (msg.body) {
          safeCallOnMessage(msg.body, globalOnMessage);
        }
      });
      subscriptions.push(sub2);
      console.log('✓ Subscribed to /user/queue/orders');
      // Remove duplicate debug subscription
      // Subscribe to specific order topics if orderIds provided
      if (orderIds) {
        updateOrderSubscriptions(orderIds, globalOnMessage);
      }
      // Subscribe to any pending order IDs
      if (pendingOrderIds.length > 0) {
        console.log('📋 Subscribing to pending orders:', pendingOrderIds);
        updateOrderSubscriptions(pendingOrderIds, globalOnMessage);
        pendingOrderIds = [];
      }
    } catch (e) {
      console.error('❌ Socket subscribe error', e);
    }
    globalOnConnect?.(frame);
  };
  client.onStompError = (frame) => {
    console.error('Broker reported error:', frame.headers['message']);
    console.error('Full error frame:', frame);
  };
  client.onWebSocketError = (event) => {
    console.error('❌ WebSocket error:', event);
  };
  client.onWebSocketClose = (event) => {
    console.log('🔌 WebSocket closed:', event.code, event.reason);
  };
  client.onDisconnect = (frame) => {
    connected = false;
    console.log('⚠️ WebSocket disconnected', frame);
    globalOnDisconnect?.(frame);
  };
  client.activate();
  console.log('🔄 WebSocket activation initiated...');
  return client;
};
// Update order-specific subscriptions
export const updateOrderSubscriptions = (orderIds, onMessage) => {
  if (!client || !connected) {
    console.log('⚠️ Cannot update subscriptions - socket not connected');
    return;
  }
  const handler = onMessage || globalOnMessage;
  if (!handler) {
    console.warn('⚠️ No message handler available');
    return;
  }
  // Convert single orderId to array for consistency
  const orderIdArray = Array.isArray(orderIds) ? orderIds : (orderIds ? [orderIds] : []);
  try {
    // Subscribe to new order topics - try multiple possible formats
    orderIdArray.forEach(orderId => {
      if (!orderSubscriptions.has(orderId)) {
        console.log(`✓ Subscribing to topic: /topic/order/${orderId}`);
        // Primary subscription: /topic/order/{orderId}
        const subscription = client.subscribe(`/topic/order/${orderId}`, (msg) => {
          console.log(`📩 Message received on /topic/order/${orderId}:`, msg.body);
          if (msg.body) {
            safeCallOnMessage(msg.body, handler);
          }
        });
        orderSubscriptions.set(orderId, subscription);
        // Also try /topic/orders/{orderId} (plural) in case backend uses that
        const subscriptionPlural = client.subscribe(`/topic/orders/${orderId}`, (msg) => {
          console.log(`📩 Message received on /topic/orders/${orderId}:`, msg.body);
          if (msg.body) {
            safeCallOnMessage(msg.body, handler);
          }
        });
        orderSubscriptions.set(`${orderId}-plural`, subscriptionPlural);
        // Also try /topic/order-updates/{orderId}
        const subscriptionUpdates = client.subscribe(`/topic/order-updates/${orderId}`, (msg) => {
          console.log(`📩 Message received on /topic/order-updates/${orderId}:`, msg.body);
          if (msg.body) {
            safeCallOnMessage(msg.body, handler);
          }
        });
        orderSubscriptions.set(`${orderId}-updates`, subscriptionUpdates);
      }
    });
    // Remove subscriptions for orders no longer needed (cleanup)
    const activeKeys = new Set();
    orderIdArray.forEach(orderId => {
      activeKeys.add(String(orderId));
      activeKeys.add(`${orderId}-plural`);
      activeKeys.add(`${orderId}-updates`);
    });
    for (const [key, subscription] of orderSubscriptions.entries()) {
      if (!activeKeys.has(String(key))) {
        console.log(`Unsubscribing from key: ${key}`);
        subscription.unsubscribe();
        orderSubscriptions.delete(key);
      }
    }
  } catch (e) {
    console.warn('Error updating order subscriptions', e);
  }
};
// Subscribe to a specific order (helper function)
export const subscribeToOrder = (orderId, onMessage) => {
  if (!client || !connected) {
    console.warn('Cannot subscribe to order - socket not connected');
    return;
  }
  if (orderSubscriptions.has(orderId)) {
    console.log(`Already subscribed to order ${orderId}`);
    return;
  }
  try {
    console.log(`Subscribing to topic: /topic/order/${orderId}`);
    const subscription = client.subscribe(`/topic/order/${orderId}`, (msg) => {
      console.log(`Message received for order ${orderId}`);
      if (msg.body) {
        safeCallOnMessage(msg.body, onMessage);
        console.log(`📩 Message received for order ${orderId}:`, msg.body);
      }
    });
    orderSubscriptions.set(orderId, subscription);
  } catch (e) {
    console.warn(`Error subscribing to order ${orderId}`, e);
  }
};
// Unsubscribe from a specific order
export const unsubscribeFromOrder = (orderId) => {
  if (orderSubscriptions.has(orderId)) {
    console.log(`Unsubscribing from topic: /topic/order/${orderId}`);
    orderSubscriptions.get(orderId).unsubscribe();
    orderSubscriptions.delete(orderId);
  }
};
// ============ RIDER LOCATION TRACKING ============
// Subscribe to rider location updates for a specific order
export const subscribeToRiderLocation = (orderId, onLocationUpdate) => {
  if (!client || !connected) {
    console.warn('⚠️ Cannot subscribe to rider location - socket not connected');
    return null;
  }
  const subscriptionKey = `rider-location-${orderId}`;
  if (riderLocationSubscriptions.has(subscriptionKey)) {
    console.log(`Already subscribed to rider location for order ${orderId}`);
    return riderLocationSubscriptions.get(subscriptionKey);
  }
  try {
    console.log(`🚴 Subscribing to rider location: /topic/rider-location/${orderId}`);
    const subscription = client.subscribe(`/topic/rider-location/${orderId}`, (msg) => {
      console.log(`📍 Rider location update for order ${orderId}:`, msg.body);
      if (msg.body) {
        try {
          const locationData = JSON.parse(msg.body);
          console.log('Parsed rider location:', locationData);
          onLocationUpdate?.(locationData);
        } catch (e) {
          console.error('Failed to parse rider location data:', e);
        }
      }
    });
    riderLocationSubscriptions.set(subscriptionKey, subscription);
    console.log(`✅ Subscribed to rider location for order ${orderId}`);
    return subscription;
  } catch (e) {
    console.error(`❌ Error subscribing to rider location for order ${orderId}:`, e);
    return null;
  }
};
// Start rider location tracking by sending message to backend
export const startRiderTracking = (orderId) => {
  if (!client || !connected) {
    console.warn('⚠️ Cannot start rider tracking - socket not connected');
    return false;
  }
  try {
    console.log(`🚀 Starting rider tracking for order ${orderId}`);
    client.publish({
      destination: '/app/rider-location.start',
      body: String(orderId)
    });
    console.log(`✅ Sent start tracking request for order ${orderId}`);
    return true;
  } catch (e) {
    console.error(`❌ Error starting rider tracking for order ${orderId}:`, e);
    return false;
  }
};
// Stop rider location tracking
export const stopRiderTracking = (orderId) => {
  if (!client || !connected) {
    console.warn('⚠️ Cannot stop rider tracking - socket not connected');
    return false;
  }
  try {
    console.log(`🛑 Stopping rider tracking for order ${orderId}`);
    client.publish({
      destination: '/app/rider-location.stop',
      body:String(orderId)
    });
    console.log(`✅ Sent stop tracking request for order ${orderId}`);
    return true;
  } catch (e) {
    console.error(`❌ Error stopping rider tracking for order ${orderId}:`, e);
    return false;
  }
};
// Unsubscribe from rider location updates
export const unsubscribeFromRiderLocation = (orderId) => {
  const subscriptionKey = `rider-location-${orderId}`;
  if (riderLocationSubscriptions.has(subscriptionKey)) {
    console.log(`🔌 Unsubscribing from rider location for order ${orderId}`);
    try {
      riderLocationSubscriptions.get(subscriptionKey).unsubscribe();
      riderLocationSubscriptions.delete(subscriptionKey);
      console.log(`✅ Unsubscribed from rider location for order ${orderId}`);
      // Also stop tracking on backend
      stopRiderTracking(orderId);
    } catch (e) {
      console.error(`❌ Error unsubscribing from rider location:`, e);
    }
  }
};
const safeCallOnMessage = (body, onMessage) => {
  try {
    const payload = JSON.parse(body);
    console.log("payload", payload);
    onMessage?.(payload);
    return;
  } catch (e) {
    // fallback to looser parsing
  }
  const parsed = tryParseKeyValueString(body) || body;
  onMessage?.(parsed);
};
const tryParseKeyValueString = (str) => {
  try {
    // attempt to find orderId and status in simple string formats like "{orderId=123, status=ACCEPTED}"
    const mOrder = str.match(/orderId\s*[:=]\s*(\d+)/i);
    const mStatus = str.match(/status\s*[:=]\s*([A-Z_]+)/i);
    if (mOrder || mStatus) {
      const obj = {};
      if (mOrder) obj.orderId = Number(mOrder[1]);
      if (mStatus) obj.status = mStatus[1];
      return obj;
    }
  } catch (e) {
    // ignore
  }
  return null;
};
export const disconnectOrderSocket = () => {
  try {
    // Unsubscribe from all general subscriptions
    subscriptions.forEach((sub) => sub.unsubscribe());
    subscriptions = [];
    // Unsubscribe from all order-specific subscriptions
    orderSubscriptions.forEach((sub) => sub.unsubscribe());
    orderSubscriptions.clear();
    // Unsubscribe from all rider location subscriptions
    riderLocationSubscriptions.forEach((sub) => sub.unsubscribe());
    riderLocationSubscriptions.clear();
    // Clear pending subscriptions
    pendingOrderIds = [];
    if (client) {
      client.deactivate();
      client = null;
    }
    connected = false;
    globalOnMessage = null;
    globalOnConnect = null;
    globalOnDisconnect = null;
    console.log('✅ Socket disconnected and cleaned up');
  } catch (e) {
    console.warn('Error during socket cleanup', e);
  }
};
// Get connection status
export const isConnected = () => connected;
// Get client instance
export const getClient = () => client;
const socketService = {
  initOrderSocket,
  updateOrderSubscriptions,
  subscribeToOrder,
  unsubscribeFromOrder,
  disconnectOrderSocket,
  isConnected,
  getClient,
  subscribeToRiderLocation,
  startRiderTracking,
  stopRiderTracking,
  unsubscribeFromRiderLocation,
};
export default socketService;
