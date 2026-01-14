package com.example.riderservice.kafkaConsumerServices;

import com.example.riderservice.dto.EventEnvelope;
import com.example.riderservice.dto.OrderReadyEvent;
import com.example.riderservice.model.order;
import com.example.riderservice.service.orderService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class OrderReadyConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderReadyConsumer.class);

    private final ObjectMapper objectMapper;
    private final orderService orderService;

    public OrderReadyConsumer(ObjectMapper objectMapper, orderService orderService) {
        this.objectMapper = objectMapper;
        this.orderService = orderService;

    }

    @KafkaListener(
            topics = "ORDER_READY",
            groupId = "delivery-service-group"
    )
    public void consume(ConsumerRecord<String, Map<String, Object>> record,
                        Acknowledgment ack) {
        try {
            String key = record.key();
            Map<String, Object> rawMessage = record.value();

            log.info("Received raw message: key={}, value={}", key, rawMessage);

            // Check if we received an error due to deserialization
            if (rawMessage == null) {
                log.error("Received null message, likely due to deserialization error");
                if (ack != null) {
                    ack.acknowledge(); // Skip this message to avoid infinite re-delivery
                }
                return;
            }

            // Check if the message is wrapped in an EventEnvelope or is a direct OrderReadyEvent
            OrderReadyEvent event;

            if (rawMessage.containsKey("payload") && rawMessage.containsKey("id") && rawMessage.containsKey("timestamp")) {
                // Message is wrapped in EventEnvelope
                log.info("Message is wrapped in EventEnvelope");
                EventEnvelope<OrderReadyEvent> envelope = objectMapper.convertValue(
                        rawMessage,
                        new TypeReference<EventEnvelope<OrderReadyEvent>>() {}
                );
                event = envelope.getPayload();
            } else {
                // Message is a direct OrderReadyEvent (flat structure)
                log.info("Message is a direct OrderReadyEvent");
                event = objectMapper.convertValue(rawMessage, OrderReadyEvent.class);
            }

            if (event == null || event.getOrderId() == null) {
                log.error("Event or orderId is null - skipping and acknowledging to avoid retries: {}", event);
                if (ack != null) ack.acknowledge();
                return;
            }

            log.info(":-)Received ORDER_READY event key={} orderId={}", key, event.getOrderId());
            System.out.println("Received ORDER_READY event key=" + key + " orderId=" + event.getOrderId());
            System.out.println("Full event: " + event);

            order neworder = order.builder()
                    .orderId(event.getOrderId())
                    .customerEmail(event.getClientId())
                    .pickupLat(event.getPickupLat().floatValue())
                    .pickupLng(event.getPickupLng().floatValue())
                    .dropLat(event.getDropLat().floatValue())
                    .dropLng(event.getDropLng().floatValue())
                    .restaurantEmail(event.getRestaurantEmail())
                    .orderPrice(event.getPrice().floatValue())
                    .otp(event.getOtp())
                    .createdAt(LocalDateTime.now())
                    .build();
            orderService.createOrder(neworder);

            if (ack != null) {
                ack.acknowledge(); // commit offset AFTER success
            }

        } catch (Exception ex) {
            log.error("Failed to process ORDER_READY event", ex);
            // If ack is available and we know this message is poison, acknowledge to skip; otherwise leave it to retry
            try {
                if (ack != null) {
                    // Do not ack by default on exception - but to avoid infinite redelivery for known-bad messages
                    // we could decide based on exception type. For now, log and leave unacked so consumer group offset won't advance.
                }
            } catch (Exception inner) {
                log.warn("Error while handling ack in error path: {}", inner.getMessage());
            }
        }
    }
}
