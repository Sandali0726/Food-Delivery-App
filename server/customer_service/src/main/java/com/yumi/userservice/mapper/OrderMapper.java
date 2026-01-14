package com.yumi.userservice.mapper;

import com.yumi.userservice.dto.order.OrderDto;
import com.yumi.userservice.dto.order.OrderData;
import com.yumi.userservice.model.Order;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderMapper {
        Order toEntity(OrderDto dto);

        OrderDto toDto(Order order);

        // Map Order entity to OrderData for events
        OrderData toOrderData(Order order);
    }
