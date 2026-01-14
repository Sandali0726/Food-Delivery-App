package com.restaurant_service.repository;

import com.restaurant_service.model.DeliveryRequestLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DeliveryRequestLogRepository extends JpaRepository<DeliveryRequestLog, UUID> {
    List<DeliveryRequestLog> findByOrderId(Long orderId);
    List<DeliveryRequestLog> findByRestaurantEmail(String restaurantEmail);

    // pageable variant
    Page<DeliveryRequestLog> findByRestaurantEmail(String restaurantEmail, Pageable pageable);
}
