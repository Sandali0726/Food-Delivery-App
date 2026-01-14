package com.yumi.userservice.mapper;

import com.yumi.userservice.dto.Profile.ProfileDto;
import com.yumi.userservice.dto.Profile.UserDetailsDto;
import com.yumi.userservice.model.Customer;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    Customer toEntity(ProfileDto dto);
    UserDetailsDto toDto(Customer entity);
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateCustomerFromProfileDto(ProfileDto dto, @MappingTarget Customer entity);
}


