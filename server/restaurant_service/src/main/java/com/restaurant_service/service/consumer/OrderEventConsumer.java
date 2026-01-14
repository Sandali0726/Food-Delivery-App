package com.restaurant_service.service.consumer;


import com.restaurant_service.dto.OrderPlacedEvent;
import com.restaurant_service.dto.RestaurantOrderCreateDto;
import com.restaurant_service.dto.RestaurantOrderItemCreateDto;
import com.restaurant_service.enums.DeliveryRequestStatus;
import com.restaurant_service.model.OrderStatus;
import com.restaurant_service.service.DeliveryRequestLogService;
import com.restaurant_service.service.RestaurantOrderItemService;
import com.restaurant_service.service.RestaurantOrderService;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class OrderEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(OrderEventConsumer.class);

    private final RestaurantOrderService service;
    private final RestaurantOrderItemService itemService;
    private final DeliveryRequestLogService deliveryRequestLogService;

    public OrderEventConsumer(RestaurantOrderService service, RestaurantOrderItemService itemService, DeliveryRequestLogService deliveryRequestLogService) {
        this.service = service;
        this.itemService = itemService;
        this.deliveryRequestLogService = deliveryRequestLogService;
    }

    @KafkaListener(topics = "ORDER_CREATED", groupId = "restaurant-service")
    public void onOrderCreated(OrderPlacedEvent dto) {
        // create the order record
        RestaurantOrderCreateDto orderDto = RestaurantOrderCreateDto.builder()
                .orderId(dto.getOrderId())
                .customerId(dto.getCustomerEmail())
                .restaurantEmail(dto.getRestaurantEmail())
                .totalAmount(BigDecimal.valueOf(dto.getOrderPrice()))
                .dropLat(dto.getDeliveryLat())
                .dropLng(dto.getDeliveryLng())
                .dropAddress(dto.getAddress())
                .otp(dto.getOtp())
                .build();

        service.create(orderDto);

        // create order items
        if (dto.getOrderItems() != null) {
            for (OrderPlacedEvent.OrderItem item : dto.getOrderItems()) {

                RestaurantOrderItemCreateDto itemDto = RestaurantOrderItemCreateDto.builder()
                        .orderId(dto.getOrderId())
                        .foodId(item.getFoodId())
                        .foodName(item.getItemName())
                        .quantity(item.getQuantity())
                        .price(BigDecimal.valueOf(item.getPrice()))
                        .build();

                try {
                    itemService.create(itemDto);
                } catch (Exception ex) {
                    // log and continue - avoid crashing the whole consumer on single item failure
                    logger.error("Failed to create order item for orderId={}, foodId={}: {}", dto.getOrderId(), item.getFoodId(), ex.getMessage());
                }
            }
        }
    }

    @KafkaListener(topics = "ORDER_CANCELLED", groupId = "restaurant-service")
    public void onOrderCancelled(Object event) {
        Long orderId = extractOrderId(event);
        if (orderId != null) {
            service.updateStatus(orderId, OrderStatus.CANCELLED);
        } else {
            logger.error("onOrderCancelled: could not extract orderId from event: {}", event);
        }
    }

    @KafkaListener(topics= "DELIVERED", groupId= "restaurant-service")
    public void onOrderDelivered(Object event) {
        Long orderId = extractOrderId(event);
        if (orderId != null) {
            service.updateStatus(orderId, OrderStatus.DELIVERED);
            deliveryRequestLogService.updateStatusByOrderId(orderId, DeliveryRequestStatus.DELIVERED );
        } else {
            logger.error("onOrderDelivered: could not extract orderId from event: {}", event);
        }

    }

    // helper to handle ConsumerRecord, Message, Map payloads and OrderPlacedEvent DTOs (or numeric/string payloads)
    private Long extractOrderId(Object event) {
        if (event == null) return null;
        try {
            // unwrap Kafka ConsumerRecord if container passed the whole record
            if (event instanceof ConsumerRecord<?, ?> consumerRecord) {
                Object value = consumerRecord.value();
                logger.debug("Unwrapped ConsumerRecord value type: {}", value == null ? "null" : value.getClass().getName());
                return extractOrderId(value);
            }
            // unwrap Spring Message if needed
            if (event instanceof Message<?> message) {
                Object payload = message.getPayload();
                logger.debug("Unwrapped Spring Message payload type: {}", payload.getClass().getName());
                return extractOrderId(payload);
            }
            if (event instanceof Map<?, ?> map) {
                Object val = map.get("orderId");
                if (val == null) return null;
                if (val instanceof Number number) return number.longValue();
                return Long.valueOf(val.toString());
            }
            if (event instanceof OrderPlacedEvent orderPlacedEvent) {
                return orderPlacedEvent.getOrderId();
            }

            // try reflection: some producer may send a different DTO implementation with same property
            Long reflected = extractOrderIdByReflection(event);
            if (reflected != null) return reflected;

            // fallback: parse from toString using helpers
            String s = event.toString();
            return parseOrderIdFromString(s);
        } catch (Exception ex) {
            // ignore and return null
            logger.debug("extractOrderId failed to parse event {}: {}", event, ex.getMessage());
        }
        return null;
    }

    private Long extractOrderIdByReflection(Object event) {
        try {
            // try public getOrderId()
            Method m = event.getClass().getMethod("getOrderId");
            Object val = m.invoke(event);
            if (val instanceof Number number) return number.longValue();
            if (val != null) return Long.valueOf(val.toString());
        } catch (NoSuchMethodException ignored) {
            // try public field access next
        } catch (Exception ex) {
            logger.debug("Reflection getOrderId failed: {}", ex.getMessage());
        }
        try {
            // try public field 'orderId'
            Field f = event.getClass().getField("orderId");
            Object val = f.get(event);
            if (val instanceof Number number) return number.longValue();
            if (val != null) return Long.valueOf(val.toString());
        } catch (NoSuchFieldException ignored) {
            // give up
        } catch (Exception ex) {
            logger.debug("Reflection read field orderId failed: {}", ex.getMessage());
        }
        return null;
    }

    private Long parseOrderIdFromString(String s) {
        if (s == null || s.isBlank()) return null;

        // try JSON style: "orderId" : 123
        Pattern jsonPattern = Pattern.compile("\"orderId\"\\s*[:=]\\s*(\\d+)");
        Matcher m = jsonPattern.matcher(s);
        if (m.find()) {
            return Long.valueOf(m.group(1));
        }

        // try key=val or key: val patterns like orderId=123 or orderId:123 or orderId= 123
        Pattern keyValuePattern = Pattern.compile("\\borderId\\b\\D*(\\d+)", Pattern.CASE_INSENSITIVE);
        m = keyValuePattern.matcher(s);
        if (m.find()) {
            return Long.valueOf(m.group(1));
        }

        // fallback: first standalone number in string
        Pattern anyNumber = Pattern.compile("(\\d+)");
        m = anyNumber.matcher(s);
        if (m.find()) {
            return Long.valueOf(m.group(1));
        }
        return null;
    }
}
