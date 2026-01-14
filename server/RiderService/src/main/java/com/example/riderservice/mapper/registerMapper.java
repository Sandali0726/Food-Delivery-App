package com.example.riderservice.mapper;

import com.example.riderservice.dto.registerDto;
import com.example.riderservice.model.rider;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Builder;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface registerMapper {


    @Mapping(target = "current_lat", ignore = true)
    @Mapping(target = "current_lng", ignore = true)
    @Mapping(target = "created_at", ignore = true)
    @Mapping(target = "updated_at", ignore = true)
    @Mapping(target = "auth", ignore = true)
    @Mapping(target = "deliveryTasks", ignore = true)
    @Mapping(target = "deliveryLogs", ignore = true)
    @Mapping(target = "rating", ignore = true)
    rider toRiderEntity(registerDto dto);
    registerDto toRegisterDTO(rider rider);


}

