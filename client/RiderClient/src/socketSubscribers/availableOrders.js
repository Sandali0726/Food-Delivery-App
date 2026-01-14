import { enhanceAvailableOrder } from '../api/delivery';
import { subscribeTopic } from '../api/ws';

const resolveOrderId = (payload) => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    return (
        payload.orderId ||
        payload.id ||
        payload.deliveryId ||
        payload.delivery_id ||
        payload.order_id ||
        null
    );
};

export const availableOrdersSubscribe = (_client, onMessage) => {
    console.log('🔌 Setting up available orders socket subscription...');

    // Topics the backend may use
    const topicNames = ['/user/topic/orders','/topic/orders'];
    const processedOrderIds = new Set(); // Prevent duplicate ORDER_CREATED events per subscription

    const subscriptions = topicNames.map((topic) => {
        console.log(`📡 Subscribing to topic: ${topic}`);
        try {
            return subscribeTopic(topic, async (message) => {
            
            try {
                const data = JSON.parse(message.body);
                
                // Handle different message types
                if (data.type === "ORDER_CREATED") {
                    const payload = data.payload || {};
                    const orderId = resolveOrderId(payload);

                    if (orderId && processedOrderIds.has(orderId)) {
                        console.log('⏭️ Skipping duplicate ORDER_CREATED for order:', orderId);
                        return;
                    }

                    if (orderId) {
                        processedOrderIds.add(orderId);
                    }

                    console.log('🆕 Processing ORDER_CREATED:', payload);
                    // Enhance the order with distance and delivery price before sending
                    try {
                        const enhancedOrder = await enhanceAvailableOrder(payload);
                        console.log('✅ Enhanced order:', enhancedOrder);
                        onMessage({ type: "ORDER_CREATED", payload: enhancedOrder });
                    } catch (error) {
                        console.error('❌ Error enhancing order:', error);
                        // Send without enhancement if enhancement fails
                        console.log('⚠️ Sending order without enhancement');
                        onMessage({ type: "ORDER_CREATED", payload: payload });
                    }
                } else if (data.type === "ORDER_REMOVED") {
                    // Backend sends orderId directly as a number, not as an object
                    const payload = data.payload;
                    const orderId = typeof payload === 'object' ? resolveOrderId(payload) : payload;

                    if (orderId && processedOrderIds.has(orderId)) {
                        processedOrderIds.delete(orderId);
                    }

                    console.log('🗑️ Processing ORDER_REMOVED, orderId:', orderId);
                    // Pass the orderId directly for consistency
                    onMessage({ type: "ORDER_REMOVED", payload: orderId });
                } else {
                    console.log('📝 Processing unknown message type:', data.type || 'no type', data);
                    // Handle direct order data (fallback for different message formats)
                    if (data.orderId || data.id) {
                        console.log('🔄 Treating as direct order creation');
                        const orderId = resolveOrderId(data);

                        if (orderId && processedOrderIds.has(orderId)) {
                            console.log('⏭️ Skipping duplicate direct order for order:', orderId);
                            return;
                        }

                        if (orderId) {
                            processedOrderIds.add(orderId);
                        }

                        try {
                            const enhancedOrder = await enhanceAvailableOrder(data);
                            onMessage({ type: "ORDER_CREATED", payload: enhancedOrder });
                        } catch (error) {
                            console.error('❌ Error enhancing direct order:', error);
                            onMessage({ type: "ORDER_CREATED", payload: data });
                        }
                    } else {
                        // Fallback for older message format
                        console.log('🔄 Fallback message handling');
                        onMessage(data);
                    }
                }
            } catch (parseError) {
                console.error('❌ Error parsing socket message:', parseError);
                console.error('❌ Raw message body:', message.body);
                
                // Try to handle as plain text or different format
                try {
                    console.log('🔄 Attempting to handle as plain order data');
                    const orderData = { orderId: Date.now(), ...message.body };
                    const orderId = resolveOrderId(orderData);

                    if (orderId && !processedOrderIds.has(orderId)) {
                        processedOrderIds.add(orderId);
                        onMessage({ type: "ORDER_CREATED", payload: orderData });
                    } else {
                        console.log('⏭️ Skipping duplicate fallback order for order:', orderId);
                    }
                } catch (fallbackError) {
                    console.error('❌ Complete fallback failed:', fallbackError);
                }
            }
        });
        } catch (subscribeError) {
            console.error(`❌ Error subscribing to topic ${topic}:`, subscribeError);
            return null; // Return null for failed subscriptions
        }
    }).filter(sub => sub !== null); // Filter out failed subscriptions
    
    console.log(`✅ Successfully subscribed to ${subscriptions.length} topics`);
    
    if (subscriptions.length === 0) {
        console.error('❌ No successful subscriptions established');
        return null;
    }
    
    // Return function to unsubscribe from all topics
    return {
        unsubscribe: () => {
            console.log('🔌 Unsubscribing from all order topics');
            subscriptions.forEach((sub) => {
                if (sub && typeof sub.unsubscribe === 'function') {
                    try {
                        sub.unsubscribe();
                    } catch (error) {
                        console.error('❌ Error unsubscribing:', error);
                    }
                }
            });
        },
    };
}