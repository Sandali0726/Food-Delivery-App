package com.restaurant_service.mapper;
import com.restaurant_service.dto.Menu_Dto;
import com.restaurant_service.model.Menu_Category;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface Menu_Mapper {

    Menu_Category toEntity(Menu_Dto dto);
    Menu_Dto toDto(Menu_Category entity);

}
