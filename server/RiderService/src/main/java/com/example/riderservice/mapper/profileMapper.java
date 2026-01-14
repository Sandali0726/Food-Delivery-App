package com.example.riderservice.mapper;


import com.example.riderservice.dto.profileDto;
import com.example.riderservice.model.rider;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.jpa.repository.JpaRepository;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface profileMapper {

    @Mapping(target = "current_lat", ignore = true)
    @Mapping(target = "current_lng", ignore = true)
    @Mapping(target = "updated_at", ignore = true)
    @Mapping(target = "auth", ignore = true)
    @Mapping(target = "deliveryTasks", ignore = true)
    @Mapping(target = "deliveryLogs", ignore = true)
    rider toEntity(profileDto dto);
    profileDto toDto(rider entity);

}
