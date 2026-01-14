package com.example.riderservice.repository;

import com.example.riderservice.model.order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface orderRepository extends JpaRepository<order,Long> {

    @Query("""
    SELECT o
    FROM order o
    WHERE (6371 * acos(
        cos(radians(:riderLat)) * cos(radians(o.pickupLat)) *
        cos(radians(o.pickupLng) - radians(:riderLng)) +
        sin(radians(:riderLat)) * sin(radians(o.pickupLat))
    )) <= :radiusInKm
    AND NOT EXISTS (
        SELECT 1
        FROM rejectOrders r
        WHERE r.orderId = o.orderId
        AND r.email = :riderEmail
    )
    ORDER BY o.createdAt DESC
""")
    List<order> findOrdersWithinRadiusNotRejected(
            @Param("riderLat") double riderLat,
            @Param("riderLng") double riderLng,
            @Param("radiusInKm") double radiusInKm,
            @Param("riderEmail") String riderEmail
    );



}
