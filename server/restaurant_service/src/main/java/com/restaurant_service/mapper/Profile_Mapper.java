package com.restaurant_service.mapper;
import com.restaurant_service.dto.Profile_Dto;
import com.restaurant_service.model.Resturant_Profile;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface Profile_Mapper {

    Resturant_Profile toEntity(Profile_Dto dto);
    Profile_Dto toDto(Resturant_Profile entity);

}
