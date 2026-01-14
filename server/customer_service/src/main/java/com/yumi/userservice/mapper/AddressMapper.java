package com.yumi.userservice.mapper;

import com.yumi.userservice.dto.AddressDto.AddressRequestDto;
import com.yumi.userservice.dto.AddressDto.AddressResponseDto;
import com.yumi.userservice.model.Address;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AddressMapper {

    Address toEntity(AddressRequestDto dto);
    AddressResponseDto toDto(Address entity);
}
