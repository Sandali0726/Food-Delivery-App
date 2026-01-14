package com.restaurant_service.mapper;

import com.restaurant_service.dto.DeliveryRequestLogCreateDto;
import com.restaurant_service.dto.DeliveryRequestLogResponseDto;
import com.restaurant_service.model.DeliveryRequestLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DeliveryRequestLogMapper {

    @Mapping(target = "requestId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    DeliveryRequestLog toEntity(DeliveryRequestLogCreateDto dto);

    DeliveryRequestLogResponseDto toDto(DeliveryRequestLog entity);
}

