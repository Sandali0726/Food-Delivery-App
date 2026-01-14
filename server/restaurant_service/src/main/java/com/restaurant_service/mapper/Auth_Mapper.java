package com.restaurant_service.mapper;
import com.restaurant_service.dto.Auth_Dto;
import com.restaurant_service.model.Auth_User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface Auth_Mapper {

    // define mapping methods here
    Auth_User toEntity(Auth_Dto dto);
    Auth_Dto toDto(Auth_User entity);

}