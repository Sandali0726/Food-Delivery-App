package com.restaurant_service.service.producer;

import com.restaurant_service.model.RestaurantOrder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class OrderStatusEventProducer {

    private final OrderEventPublisher publisher;

    public OrderStatusEventProducer(OrderEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void publishOrderAccepted(RestaurantOrder order) {
        if (order == null) return;
        Map<String, Object> event = new HashMap<>();
        event.put("orderId", order.getOrderId());
        event.put("status", order.getStatus() == null ? null : order.getStatus().name());
        // use orderId as key when publishing
        String key = order.getOrderId() == null ? null : String.valueOf(order.getOrderId());
        publisher.publish("ORDER_ACCEPTED", key, event);
    }

    // note: method name kept as requested (lowercase 'o')
    public void publishorderProcessing(RestaurantOrder order) {
        if (order == null) return;
        Map<String, Object> event = new HashMap<>();
        event.put("orderId", order.getOrderId());
        event.put("status", order.getStatus() == null ? null : order.getStatus().name());
        String key = order.getOrderId() == null ? null : String.valueOf(order.getOrderId());
        // publish under PREPARING topic which matches the OrderStatus.PREPARING
        publisher.publish("ORDER_PREPARING", key, event);
    }

    public void publishorderStatusReady(RestaurantOrder order) {
        if (order == null) return;
        Map<String, Object> event = new HashMap<>();
        event.put("orderId", order.getOrderId());
        event.put("status", order.getStatus() == null ? null : order.getStatus().name());
        String key = order.getOrderId() == null ? null : String.valueOf(order.getOrderId());
        // publish under PREPARING topic which matches the OrderStatus.PREPARING
        publisher.publish("ORDER_OK", key, event);
    }

}
