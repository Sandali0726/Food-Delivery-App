package com.example.riderservice.mapper;

import com.example.riderservice.dto.authDto;
import com.example.riderservice.model.auth;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface authMapper {

    auth toAuthEntity(authDto dto);
    authDto toAuthDTO(auth entity);
}
