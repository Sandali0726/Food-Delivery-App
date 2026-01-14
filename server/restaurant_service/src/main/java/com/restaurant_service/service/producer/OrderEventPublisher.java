package com.restaurant_service.service.producer;

import com.restaurant_service.model.RestaurantOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OrderEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Publish a generic event envelope to Kafka. Envelope contains the payload and a timestamp.
     *
     * @param topic   kafka topic name
     * @param key     message key (can be null)
     * @param payload arbitrary payload object (will be serialized by configured serializer)
     */
    public void publish(String topic, String key, Object payload) {
        Map<String, Object> envelope = Map.of(
                "id", UUID.randomUUID().toString(),
                "timestamp", Instant.now().toString(),
                "payload", payload
        );

        // KafkaTemplate.send(...) returns a CompletableFuture<SendResult<...>> in this setup.
        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, key, envelope);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to publish event to topic={} key={}", topic, key, ex);
            } else if (result != null && result.getRecordMetadata() != null) {
                log.debug("Published event to topic={} key={} offset={} partition={}",
                        topic,
                        key,
                        result.getRecordMetadata().offset(),
                        result.getRecordMetadata().partition());
            } else {
                log.debug("Published event to topic={} key={} (no metadata)", topic, key);
            }
        });
    }

}
