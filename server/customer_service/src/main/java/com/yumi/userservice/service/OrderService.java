package com.yumi.userservice.service;

import com.yumi.userservice.dto.order.*;
import com.yumi.userservice.mapper.OrderMapper;
import com.yumi.userservice.model.Order;
import com.yumi.userservice.repository.OrderRepository;
import com.yumi.userservice.service.kafka.OrderEventProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OrderService {
    @Autowired
    private OrderMapper orderMapper;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderEventProducer orderEventProducer;
    @Autowired
    private SimpMessagingTemplate messagingTemplate; // used to push real-time updates to frontend

    public OrderDto save(OrderDto dto) {
        Order order = orderMapper.toEntity(dto);
        // Ensure child items reference the parent order so FK gets saved
        List<com.yumi.userservice.model.OrderItem> items = order.getOrderItems();
        if (items != null) {
            for (com.yumi.userservice.model.OrderItem item : items) {
                item.setOrder(order);
            }
        }
        Order saved = orderRepository.save(order);

        // Build event payload from saved order
        OrderData data = orderMapper.toOrderData(saved);
        List<OrderPlacedEvent.OrderItem> eventItems = saved.getOrderItems() == null ? List.of() :
                saved.getOrderItems().stream()
                        .map(i -> OrderPlacedEvent.OrderItem.builder()
                                .foodId(i.getFoodId())
                                .itemName(i.getItemName())
                                .quantity(i.getQuantity())
                                .price(i.getPrice())
                                .build())
                        .toList();
        OrderPlacedEvent event = new OrderPlacedEvent(
                data.getOrderId(),
                data.getOtp(),
                data.getRestaurantEmail(),
                eventItems,
                data.getCustomerEmail(),
                data.getOrderPrice(),
                data.getDeliveryLat(),
                data.getDeliveryLng(),
                data.getAddress()

        );

        // Publish to Kafka for restaurant service consumption
        orderEventProducer.sendOrderCreated(event);
        return orderMapper.toDto(saved);
    }

    public void delete(Long id) {

        orderRepository.deleteById(id);
        orderEventProducer.sendOrderCancelled(id);
    }

    public void updateStatus(Long orderId, Order.Status status) {
        System.out.println("[OrderService] Updating order status: orderId=" + orderId + ", newStatus=" + status);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(status);
        Order saved = orderRepository.save(order); //can create order twice check this

        // send websocket notification to frontend about this order status change
        try {
            OrderDto dto = orderMapper.toDto(orderRepository.save(order));
            String destination = "/topic/orders/" + saved.getOrderId();
            messagingTemplate.convertAndSend(destination, dto);
            System.out.println("[OrderService] Websocket update published to " + destination);
        } catch (Exception e) {
            System.out.println("[OrderService] Failed to publish websocket update: " + e.getMessage());
        }

        if (status == Order.Status.DELIVERED) {
            orderEventProducer.sendOrderDelivered(orderId);
            System.out.println("[OrderService] Order delivered event sent to Kafka: orderId=" + orderId);
        }
    }
    public void cancelOrder(Long orderId) {
        updateStatus(orderId, Order.Status.CANCEL);
        orderEventProducer.sendOrderCancelled(orderId);
    }

    public List<OrderDto> getByEmail(String email) {
        return orderRepository.findAllByCustomerEmail(email)
                .stream()
                .map(orderMapper::toDto)
                .toList();
    }

    public OrderDto getById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        return orderMapper.toDto(order);
    }
}
