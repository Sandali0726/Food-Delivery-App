package com.yumi.userservice.service.kafka;

import com.yumi.userservice.dto.order.OrderPlacedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class OrderEventProducer {

    private final KafkaTemplate<Long, OrderPlacedEvent> kafkaTemplate;
    private final KafkaTemplate<Long, Map<String, Object>> mapKafkaTemplate;

    public OrderEventProducer(KafkaTemplate<Long, OrderPlacedEvent> kafkaTemplate,
                              KafkaTemplate<Long, Map<String, Object>> mapKafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
        this.mapKafkaTemplate = mapKafkaTemplate;
    }

    //  Send ORDER_CREATED event
    public void sendOrderCreated(OrderPlacedEvent event) {
        Long key = event.getOrderId();
        kafkaTemplate.send("ORDER_CREATED", key, event);
        System.out.println("ORDER_CREATED event sent for customer: " + key);
    }

    //  Send ORDER_CANCELLED event
    public void sendOrderCancelled(Long orderId) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId",orderId);
        payload.put("status", "CANCELLED");
        mapKafkaTemplate.send("ORDER_CANCELLED", orderId, payload);
        System.out.println("ORDER_CANCELLED event sent for customer: " + orderId);
    }

    //  Send DELIVERED event with simple Map payload
    public void sendOrderDelivered(Long orderId) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", orderId);
        payload.put("status", "DELIVERED");
        mapKafkaTemplate.send("DELIVERED", orderId, payload);
        System.out.println("DELIVERED event sent for orderId=" + orderId);
    }
}



