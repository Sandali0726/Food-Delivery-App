package com.restaurant_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Profile_Dto {

    private String id;
    private String name;
    private Integer contactNumber;
    private String coverImageUrl;
    private String profileImageUrl;
    private String description;
    private Double latitude;
    private Double longitude;
    @NotNull
    private Boolean open;


}
