package com.example.riderservice.controller;


import com.example.riderservice.enums.Delivery_status;
import com.example.riderservice.grpcClientService.OrderDetailsClient;
import com.example.riderservice.grpcClientService.customerDetailsClient;
import com.example.riderservice.grpcClientService.customerOrderStatusClient;
import com.example.riderservice.grpcClientService.restaurantDetailsClient;
import com.example.riderservice.model.delivery_task;
import com.example.riderservice.model.order;
import com.example.riderservice.service.orderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class orderController {

    public final orderService orderService;
    public final OrderDetailsClient orderDetailsClient;
    public final customerOrderStatusClient customerOrderStatusClient;
    public final restaurantDetailsClient restaurantDetailsClient;
    public final customerDetailsClient customerDetailsClient;

    @GetMapping("/api/orders/available")
    public ResponseEntity<?> getOrders(Principal principal) {

        String riderEmail = principal.getName();
        List<order> orders = orderService.getAllOrders(riderEmail);
        return ResponseEntity.ok(orders);

    }

    @PostMapping("/api/orders/create")
    public ResponseEntity<?> createOrder(@RequestBody order order) {
        order.setCreatedAt(LocalDateTime.now());
        order createdOrder = orderService.createOrder(order);
        return ResponseEntity.ok(createdOrder);
    }

    @PostMapping("/api/orders/accept")
    public ResponseEntity<?> acceptOrder(@RequestParam Long orderId,
                                         @RequestParam String riderEmail,
                                         @RequestParam float totalDistance,
                                         @RequestParam float totalTime) {

        try {
            delivery_task task = orderService.acceptOrder(
                    orderId,
                    riderEmail,
                    totalDistance,
                    totalTime
            );
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/api/orders/getDeliveryFee")
    public ResponseEntity<?> getDeliveryFee(@RequestParam float totalDistance,
                                            @RequestParam float totalTime) {
        try {
            float deliveryFee = orderService.calculateDeliveryFee(totalDistance, totalTime);
            return ResponseEntity.ok(deliveryFee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



    @GetMapping("/api/orders/orderItems")
    public ResponseEntity<?> getOrderItems(@RequestParam Long orderId) {
        try {
            orderDetailsClient.getOrderDetails(orderId);
            return ResponseEntity.ok("Order items fetched successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/api/orders/updateCustomerOrderStatus")
    public ResponseEntity<?> updateCustomerOrderStatus(@RequestParam Long orderId) {
        try {
            String status = customerOrderStatusClient.updateCustomerOrderStatus(orderId , String.valueOf(Delivery_status.PICKED_UP));
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/api/orders/restaurantDetails")
    public ResponseEntity<?> getRestaurantDetails(@RequestParam String email) {
        try {
            restaurantDetailsClient.getRestaurantDetails(email);
            return ResponseEntity.ok("Restaurant details fetched successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/api/orders/customerDetails")
    public ResponseEntity<?> getCustomerDetails(@RequestParam String email) {
        try {
            customerDetailsClient.getCustomerDetails(email);
            return ResponseEntity.ok("Customer details fetched successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/api/orders/rejectOrder")
    public ResponseEntity<?> rejectOrder(@RequestParam Long orderId, @RequestParam String email) {
        try {
            String response = orderService.addRejectedOrders(orderId,email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }




}
