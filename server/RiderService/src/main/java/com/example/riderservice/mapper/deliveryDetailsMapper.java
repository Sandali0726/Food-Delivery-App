package com.example.riderservice.mapper;


import com.example.riderservice.dto.deliveryDetailsDto;
import com.example.riderservice.dto.deliveryDetailsHistoryDto;
import com.example.riderservice.model.delivery_task;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface deliveryDetailsMapper {

    @Mapping(target = "otp_number", ignore = true)
    @Mapping(target = "rider", ignore = true)

    delivery_task toDeliveryDetailsEntity(deliveryDetailsDto dto);


    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "restaurantName", ignore = true)
    @Mapping(target = "restaurantPhone", ignore = true)
    @Mapping(target = "customerName", ignore = true)
    @Mapping(target = "customerPhone", ignore = true)
    deliveryDetailsDto toDeliveryDetailsDTO(delivery_task entity);


    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "restaurantName", ignore = true)
    @Mapping(target = "restaurantPhone", ignore = true)
    @Mapping(target = "customerName", ignore = true)
    @Mapping(target = "customerPhone", ignore = true)
    deliveryDetailsHistoryDto toDeliveryDetailsHistoryDTO(delivery_task entity);


}
