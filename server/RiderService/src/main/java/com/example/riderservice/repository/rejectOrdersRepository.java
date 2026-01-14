package com.example.riderservice.repository;

import com.example.riderservice.model.rejectOrders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface rejectOrdersRepository extends JpaRepository<rejectOrders,UUID> {

    List<rejectOrders> findByOrderId(Long orderId);
}
