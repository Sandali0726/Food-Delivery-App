package com.restaurant_service.repository;

import com.restaurant_service.model.OrderStatus;
import com.restaurant_service.model.RestaurantOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RestaurantOrderRepository extends JpaRepository<RestaurantOrder, Long> {
    List<RestaurantOrder> findByStatus(OrderStatus status);

    List <RestaurantOrder > findByRestaurantEmail(String email);

    // pageable variants
    Page<RestaurantOrder> findByStatus(OrderStatus status, Pageable pageable);
    Page<RestaurantOrder> findByRestaurantEmail(String email, Pageable pageable);

    // Added combined queries to support filtering by authenticated restaurant + optional status
    List<RestaurantOrder> findByRestaurantEmailAndStatus(String restaurantEmail, OrderStatus status);
    Page<RestaurantOrder> findByRestaurantEmailAndStatus(String restaurantEmail, OrderStatus status, Pageable pageable);

    // Use a long return type and provide a case-insensitive variant to avoid nulls and case issues
    long countByRestaurantEmailIgnoreCase(String restaurantEmail);

    // kept for compatibility (if other code relies on it) but prefer the ignore-case long version
    Integer countByRestaurantEmail(String restaurantEmail);

    @Query("SELECT COALESCE(SUM(ro.totalAmount), 0) FROM RestaurantOrder ro WHERE LOWER(ro.restaurantEmail) = LOWER(:restaurantEmail) AND ro.status <> com.restaurant_service.model.OrderStatus.NEW")
    BigDecimal sumTotalAmountByRestaurantEmailIgnoreCase(@Param("restaurantEmail") String restaurantEmail);
}
