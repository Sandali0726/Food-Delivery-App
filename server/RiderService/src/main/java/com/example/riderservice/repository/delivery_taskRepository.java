package com.example.riderservice.repository;

import com.example.riderservice.enums.Delivery_status;
import com.example.riderservice.model.delivery_task;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface delivery_taskRepository extends JpaRepository<delivery_task, UUID> {

    Optional<List<delivery_task>>findByRiderEmail(String orderId);

    Optional<List<delivery_task>>findByRiderEmailAndStatusNotInOrderByAcceptedAtDesc(String orderId , List<Delivery_status> excludedStatuses);

    Optional<List<delivery_task>>findByRiderEmailAndStatusInOrderByDeliveredAtDesc(String orderId , List<Delivery_status> excludedStatuses, Pageable pageable);
    delivery_task findByOrderId(Long orderId);
    int countByRiderEmailAndStatusNotIn(String email, List<Delivery_status> statuses);
    Long countByStatusAndRiderEmailAndDeliveredAtBetween(Delivery_status status,String email,LocalDateTime start, LocalDateTime end);
    @Query("""
        SELECT COALESCE(SUM(d.deliveryPrice), 0)
        FROM delivery_task d
        WHERE d.status = :status
          AND d.rider.email = :email
          AND d.deliveredAt BETWEEN :start AND :end
    """)
    BigDecimal sumDeliveryPriceByStatusAndDeliveredAtBetween(Delivery_status status, LocalDateTime start, LocalDateTime end,String email);
    Long countByStatusAndRiderEmail(Delivery_status status ,String email);
    @Query("""
        SELECT COALESCE(SUM(d.deliveryPrice), 0)
        FROM delivery_task d
        WHERE d.status = :status
            AND d.rider.email = :email
    """)
    BigDecimal sumDeliveryPriceByStatus(Delivery_status status, String email);
    Long countByRiderEmail(String email);

    // New query methods to support filtering by orderId and/or deliveredAt range
    Optional<List<delivery_task>> findByRiderEmailAndOrderIdAndStatusInOrderByDeliveredAtDesc(String riderEmail, Long orderId, List<Delivery_status> status, Pageable pageable);

    Optional<List<delivery_task>> findByRiderEmailAndDeliveredAtBetweenAndStatusInOrderByDeliveredAtDesc(String riderEmail, LocalDateTime start, LocalDateTime end, List<Delivery_status> status, Pageable pageable);

    Optional<List<delivery_task>> findByRiderEmailAndOrderIdAndDeliveredAtBetweenAndStatusInOrderByDeliveredAtDesc(String riderEmail, Long orderId, LocalDateTime start, LocalDateTime end, List<Delivery_status> status, Pageable pageable);

}
