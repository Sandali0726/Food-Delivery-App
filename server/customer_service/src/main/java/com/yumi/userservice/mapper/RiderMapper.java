package com.yumi.userservice.mapper;

import com.yumi.userservice.dto.Rider.RiderReviewDto;
import com.yumi.userservice.dto.Rider.RiderReviewResponseDTO;
import com.yumi.userservice.model.RiderReview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RiderMapper {

   RiderReview toEntity(RiderReviewDto dto);
    RiderReviewDto toDto(RiderReview entity);
    RiderReviewResponseDTO toDtoResponse(RiderReview entity);
    RiderReview toEntityResponse(RiderReviewResponseDTO dto);
}
