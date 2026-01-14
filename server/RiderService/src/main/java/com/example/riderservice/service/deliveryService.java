package com.example.riderservice.service;


import com.example.grpc.OrderDetailsResponse;
import com.example.grpc.ReviewRateResponse;
import com.example.grpc.customer.CustomerDetailsResponse;
import com.example.riderservice.dto.deliveryDetailsDto;
import com.example.riderservice.dto.deliveryDetailsHistoryDto;
import com.example.riderservice.enums.Delivery_status;
import com.example.riderservice.grpcClientService.*;
import com.example.riderservice.mapper.deliveryDetailsMapper;
import com.example.riderservice.model.delivery_task;
import com.example.riderservice.model.orderItem;
import com.example.riderservice.repository.delivery_taskRepository;
import com.restaurant_service.grpc.RestaurantResponse;
import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class deliveryService {

    private final delivery_taskRepository deliveryTaskRepository;
    private final deliveryDetailsMapper deliveryDetailsMapper;
    private final customerDetailsClient customerDetailsClient;
    private final restaurantDetailsClient restaurantDetailsClient;
    private final OrderDetailsClient orderDetailsClient;
    private final customerOrderStatusClient customerOrderStatusClient;
    private final rateAndReviewForOrderClient rateAndReviewForOrderClient;

    public List<deliveryDetailsDto> getDeliveryDetailsByEmail(String email) {

        List <delivery_task> order = deliveryTaskRepository.findByRiderEmailAndStatusNotInOrderByAcceptedAtDesc(email,List.of(Delivery_status.DELIVERED, Delivery_status.CANCELLED,Delivery_status.FAILED))
                .orElseThrow(() -> new RuntimeException("Delivery task not found for email: " + email));
        System.out.println("Delivery Task: " + email);



        List<deliveryDetailsDto> deliveryDetailsDtos = new ArrayList<>();

        for(delivery_task dt : order){
            deliveryDetailsDto dto = deliveryDetailsMapper.toDeliveryDetailsDTO(dt);

            /* CUSTOMER */
            try {
                CustomerDetailsResponse c =
                        customerDetailsClient.getCustomerDetails(dto.getCustomerEmail());
                dto.setCustomerName(c.getCustomerName());
                dto.setCustomerPhone(c.getCustomerPhone());
            } catch (StatusRuntimeException e) {
                System.out.println("Customer gRPC failed for {}"+dto.getCustomerEmail()+e);
                dto.setCustomerName("John Doe");
                dto.setCustomerPhone("0000000000");
            }

            /* RESTAURANT */
            try {
                RestaurantResponse r =
                        restaurantDetailsClient.getRestaurantDetails(dto.getRestaurantId());
                dto.setRestaurantName(r.getName());
                dto.setRestaurantPhone(r.getContactNumber());
            } catch (StatusRuntimeException e) {
                System.out.println("Customer gRPC failed for {}"+dto.getRestaurantId()+e);
                dto.setRestaurantName("Restaurant XYZ");
                dto.setRestaurantPhone("0000000000");
            }

            /* ORDER */
            try {
                OrderDetailsResponse o =
                        orderDetailsClient.getOrderDetails(dto.getOrderId());

                List<orderItem> items = new ArrayList<>();
                for (var i : o.getItemsList()) {
                    items.add(new orderItem(i.getOrderName(), (int) i.getOrderQuantity()));
                }
                dto.setOrderItems(items);
            } catch (StatusRuntimeException e) {
                System.out.println("Customer gRPC failed for {}"+dto.getOrderId()+e);
                List<orderItem> items = new ArrayList<>();
                items.add(new orderItem("Item A", 1));
                items.add(new orderItem("Item B", 2));
                dto.setOrderItems(items);
            }

            deliveryDetailsDtos.add(dto);

        }

        return deliveryDetailsDtos;
    }

    // Updated method signature to accept optional orderId and date
    public List<deliveryDetailsHistoryDto> getDeliveredHistoryByEmail(String email, int page , int size, Long orderId, LocalDate date) {

        Pageable pageable = PageRequest.of(page,size);

        List<delivery_task> order;

        List<Delivery_status> statusList = List.of(Delivery_status.DELIVERED, Delivery_status.CANCELLED, Delivery_status.FAILED);

        if (orderId != null && date != null) {
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();
            order = deliveryTaskRepository.findByRiderEmailAndOrderIdAndDeliveredAtBetweenAndStatusInOrderByDeliveredAtDesc(email, orderId, start, end, statusList, pageable)
                    .orElseThrow(() -> new RuntimeException("Delivered task not found for email: " + email));
        } else if (orderId != null) {
            order = deliveryTaskRepository.findByRiderEmailAndOrderIdAndStatusInOrderByDeliveredAtDesc(email, orderId, statusList, pageable)
                    .orElseThrow(() -> new RuntimeException("Delivered task not found for email: " + email));
        } else if (date != null) {
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();
            order = deliveryTaskRepository.findByRiderEmailAndDeliveredAtBetweenAndStatusInOrderByDeliveredAtDesc(email, start, end, statusList, pageable)
                    .orElseThrow(() -> new RuntimeException("Delivered task not found for email: " + email));
        } else {
            order = deliveryTaskRepository.findByRiderEmailAndStatusInOrderByDeliveredAtDesc(email, statusList, pageable)
                    .orElseThrow(() -> new RuntimeException("Delivered task not found for email: " + email));
        }

        System.out.println("Delivered Task: " + email);
        List<deliveryDetailsHistoryDto> deliveryDetailsDtos = new ArrayList<>();

        for(delivery_task dt : order){
            deliveryDetailsHistoryDto dto =  deliveryDetailsMapper.toDeliveryDetailsHistoryDTO(dt);

            // grpc call to customer service to get customer details

            /* CUSTOMER */
            try {
                CustomerDetailsResponse c =
                        customerDetailsClient.getCustomerDetails(dto.getCustomerEmail());
                dto.setCustomerName(c.getCustomerName());
                dto.setCustomerPhone(c.getCustomerPhone());
            } catch (StatusRuntimeException e) {
                System.out.println("Customer gRPC failed for {}"+dto.getCustomerEmail()+e);
                dto.setCustomerName("John Doe");
                dto.setCustomerPhone("0000000000");
            }

            /* RESTAURANT */
            try {
                RestaurantResponse r =
                        restaurantDetailsClient.getRestaurantDetails(dto.getRestaurantId());
                dto.setRestaurantName(r.getName());
                dto.setRestaurantPhone(r.getContactNumber());
            } catch (StatusRuntimeException e) {
                System.out.println("Customer gRPC failed for {}"+dto.getRestaurantId()+e);
                dto.setRestaurantName("Restaurant XYZ");
                dto.setRestaurantPhone("0000000000");
            }

            /* ORDER */
            try {
                OrderDetailsResponse o =
                        orderDetailsClient.getOrderDetails(dto.getOrderId());

                List<orderItem> items = new ArrayList<>();
                for (var i : o.getItemsList()) {
                    items.add(new orderItem(i.getOrderName(), (int) i.getOrderQuantity()));
                }
                dto.setOrderItems(items);
            } catch (StatusRuntimeException e) {
                System.out.println("Customer gRPC failed for {}"+dto.getOrderId()+e);
                List<orderItem> items = new ArrayList<>();
                items.add(new orderItem("Item A", 1));
                items.add(new orderItem("Item B", 2));
                dto.setOrderItems(items);
            }

            /* REVIEW (OPTIONAL!) */
            try {
                ReviewRateResponse rr =
                        rateAndReviewForOrderClient.getRateAndReviewForOrder(dto.getOrderId());
                dto.setRating(rr.getRating());
            } catch (StatusRuntimeException e) {
                System.out.println("Customer gRPC failed for {}"+dto.getOrderId()+e);
                dto.setRating(0.0f); // or 0.0f
            }
            deliveryDetailsDtos.add(dto);

        }

        return deliveryDetailsDtos;
    }


    public deliveryDetailsDto updateStatusOfOrder(Long orderId, String status) {

        delivery_task task = deliveryTaskRepository.findByOrderId(orderId);
        if(task == null){
            throw new RuntimeException("Delivery task not found for orderId: " + orderId);
        }
        if(status.equals("PICKED_UP")){
            task.setPickedAt(LocalDateTime.now());
        }else if(status.equals("DELIVERED")){
            task.setDeliveredAt(LocalDateTime.now());
        }else if(status.equals("CANCELLED") || status.equals("FAILED")){
            task.setDeliveredAt(LocalDateTime.now());  // can be a problem
        }
        task.setStatus( Delivery_status.valueOf(status));
        deliveryTaskRepository.save(task);
        // Should Call GRPC to update customer order status
        try{
            String response = customerOrderStatusClient.updateCustomerOrderStatus(orderId ,status);
            System.out.println("Customer order status updated: " + response);
        }catch(Exception e){
            System.out.println("Failed to update customer order status through : " + e.getMessage());
        }

        deliveryDetailsDto response = deliveryDetailsMapper.toDeliveryDetailsDTO(task);
        return response;
    }

    public String validateOrderOtp(Long orderId, Long otp){
        delivery_task task = deliveryTaskRepository.findByOrderId(orderId);
        if(task == null){
            throw new RuntimeException("Delivery task not found for orderId: " + orderId);
        }
        if(Objects.equals(task.getOtp_number(), otp)){
            return "OTP validated successfully";
        }else{
            throw new RuntimeException("Invalid OTP for orderId: " + orderId);
        }
    }

    public int countDeliveriesByRiderEmail(String email) {
        return deliveryTaskRepository.countByRiderEmailAndStatusNotIn(email, List.of(Delivery_status.CANCELLED,Delivery_status.FAILED));
    }



}
