package com.restaurant_service.service;

import com.restaurant_service.dto.RestaurantOrderItemCreateDto;
import com.restaurant_service.dto.RestaurantOrderItemResponseDto;

import java.util.List;
import java.util.UUID;

public interface RestaurantOrderItemService {
    RestaurantOrderItemResponseDto create(RestaurantOrderItemCreateDto dto);
    RestaurantOrderItemResponseDto getById(UUID id);
    List<RestaurantOrderItemResponseDto> listByOrderId(Long orderId);
    void delete(UUID id);
}
