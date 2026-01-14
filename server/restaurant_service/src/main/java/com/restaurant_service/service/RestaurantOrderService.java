package com.restaurant_service.service;

import com.restaurant_service.dto.RestaurantOrderCreateDto;
import com.restaurant_service.dto.RestaurantOrderResponseDto;
import com.restaurant_service.dto.RevenueResponseDto;
import com.restaurant_service.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RestaurantOrderService {
    RestaurantOrderResponseDto create(RestaurantOrderCreateDto dto);
    RestaurantOrderResponseDto getById(Long id);
    List<RestaurantOrderResponseDto> list(OrderStatus status);

    // paginated listing
    Page<RestaurantOrderResponseDto> list(OrderStatus status, Pageable pageable);

    RestaurantOrderResponseDto updateStatus(Long id, OrderStatus status);
    void delete(Long id);
    List<RestaurantOrderResponseDto> getallOdersByRestaurantId();

    // return primitive long to avoid nulls and match repository semantics
    long getOrdersCount(String restaurantEmail);

    RevenueResponseDto getRevenueByRestaurantEmail(String restaurantEmail);
}
