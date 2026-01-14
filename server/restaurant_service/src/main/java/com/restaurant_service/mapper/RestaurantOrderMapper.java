package com.restaurant_service.mapper;

import com.restaurant_service.dto.RestaurantOrderCreateDto;
import com.restaurant_service.dto.RestaurantOrderResponseDto;
import com.restaurant_service.model.RestaurantOrder;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RestaurantOrderMapper {
    RestaurantOrder toEntity(RestaurantOrderCreateDto dto);
    RestaurantOrderResponseDto toDto(RestaurantOrder entity);
    List<RestaurantOrderResponseDto> toDtoList(List<RestaurantOrder> e);
}
