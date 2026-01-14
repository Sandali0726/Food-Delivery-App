package com.restaurant_service.mapper;

import com.restaurant_service.dto.Food_Dto;
import com.restaurant_service.dto.Food_get_dto;
import com.restaurant_service.model.Food_Item;
import com.restaurant_service.model.Menu_Category;
import com.restaurant_service.model.Resturant_Profile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface Food_Mapper {

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "restaurant", ignore = true),
            @Mapping(target = "category", ignore = true)
    })
    Food_Item toEntity(Food_Dto dto);

    @Mappings({
            @Mapping(target = "restaurantEmail", source = "restaurant.id"),
            @Mapping(target = "categoryId", source = "category.id")
    })
    Food_get_dto toDto(Food_Item entity);

    default Menu_Category mapCategoryById(Long id) {
        if (id == null) return null;
        Menu_Category c = new Menu_Category();
        c.setId(id);
        return c;
    }

    default Resturant_Profile mapRestaurantByEmail(String email) {
        if (email == null) return null;
        Resturant_Profile r = new Resturant_Profile();
        r.setId(email);
        return r;
    }
}
