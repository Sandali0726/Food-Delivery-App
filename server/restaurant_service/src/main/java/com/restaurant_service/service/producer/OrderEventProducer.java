package com.restaurant_service.service.producer;

import com.restaurant_service.model.DeliveryRequestLog;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class OrderEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OrderEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishOrderReady(DeliveryRequestLog log) {
        Map<String, Object> event = new HashMap<>();
        event.put("requestId", log.getRequestId());
        event.put("orderId", log.getOrderId());
        event.put("restaurantEmail", log.getRestaurantEmail());
        event.put("clientId", log.getClientId());
        event.put("pickupLat", log.getPickupLat());
        event.put("pickupLng", log.getPickupLng());
        event.put("dropLat", log.getDropLat());
        event.put("dropLng", log.getDropLng());
        event.put("status", log.getStatus().name());
        event.put("deliveryId", log.getDeliveryId());
        event.put("createdAt", log.getCreatedAt());
        event.put("price", log.getPrice());
        event.put("updatedAt", log.getUpdatedAt());
        event.put( "otp", log.getOtp());

        kafkaTemplate.send("ORDER_READY", event);
    }


}
