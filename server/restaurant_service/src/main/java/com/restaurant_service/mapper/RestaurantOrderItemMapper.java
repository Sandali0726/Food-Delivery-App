package com.restaurant_service.mapper;

import com.restaurant_service.dto.RestaurantOrderItemCreateDto;
import com.restaurant_service.dto.RestaurantOrderItemResponseDto;
import com.restaurant_service.model.RestaurantOrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface RestaurantOrderItemMapper {

    RestaurantOrderItemMapper INSTANCE = Mappers.getMapper(RestaurantOrderItemMapper.class);

    @Mapping(target = "orderItemId", ignore = true)
    RestaurantOrderItem toEntity(RestaurantOrderItemCreateDto dto);

    RestaurantOrderItemResponseDto toDto(RestaurantOrderItem entity);
}
