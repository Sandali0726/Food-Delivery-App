package com.yumi.userservice.mapper;

import com.yumi.userservice.dto.Resturant.RestaurantReviewDto;
import com.yumi.userservice.model.RestaurantReview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RestaurantMapper {

    RestaurantReview toEntity(RestaurantReviewDto dto);
    RestaurantReviewDto toDto(RestaurantReview entity);

}
