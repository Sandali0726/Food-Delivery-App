package com.yumi.userservice.service.kafka;

import com.yumi.userservice.model.Order;
import com.yumi.userservice.service.OrderService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class OrderStatusListener {

    private final OrderService service; // your service to update order status

    public OrderStatusListener(OrderService service) {
        this.service = service;
    }

    @KafkaListener(topics = "ORDER_ACCEPTED", groupId = "user-service")
    public void onOrderAccepted(@Payload Map<String, Object> event) {
        handleOrderEvent(event, Order.Status.ACCEPTED);
    }

    @KafkaListener(topics = "ORDER_PREPARING", groupId = "user-service")
    public void onOrderPreparing(@Payload Map<String, Object> event) {
        handleOrderEvent(event, Order.Status.PREPARING);
    }

    @KafkaListener(topics = "ORDER_OK", groupId = "user-service")
    public void onOrderReady(@Payload Map<String, Object> event) {
        // Treat ORDER_OK as READY in our domain
        handleOrderEvent(event, Order.Status.READY);
    }

    // common method to process the event; prefer status from topic for consistency
    private void handleOrderEvent(Map<String, Object> event, Order.Status statusFromTopic) {
        if (event == null) {
            System.out.println("Invalid order event: null");
            return;
        }

        Map<String, Object> payload = extractPayload(event);
        if (payload == null || !payload.containsKey("orderId")) {
            System.out.println("Invalid order event (missing orderId): " + event);
            return;
        }

        try {
            Long orderId = Long.valueOf(String.valueOf(payload.get("orderId")));

            Object statusObj = payload.get("status");
            if (statusObj != null) {
                String statusStr = String.valueOf(statusObj);
                if (!statusStr.equals(statusFromTopic.name())) {
                    System.out.println("Status from topic (" + statusFromTopic + ") differs from payload ('" + statusStr + "'). Using topic-derived status.");
                }
            }

            service.updateStatus(orderId, statusFromTopic); // update based on topic mapping
            System.out.println("Order " + orderId + " updated to status: " + statusFromTopic);
        } catch (IllegalArgumentException ex) {
            System.out.println("Failed to parse orderId or status for event: " + event + ", error: " + ex.getMessage());
        } catch (Exception ex) {
            System.out.println("Failed to update order status for event: " + event + ", error: " + ex.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractPayload(Map<String, Object> event) {
        // If event has a nested 'payload', prefer it; else treat event itself as payload
        Object nested = event.get("payload");
        if (nested instanceof Map<?, ?> nestedMap) {
            try {
                return (Map<String, Object>) nestedMap;
            } catch (ClassCastException e) {
                // fall through
            }
        }
        return event;
    }
}
