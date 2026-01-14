package com.restaurant_service.repository;

import com.restaurant_service.model.RestaurantOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RestaurantOrderItemRepository extends JpaRepository<RestaurantOrderItem, UUID> {
    List<RestaurantOrderItem> findByOrderId(Long orderId);
}
