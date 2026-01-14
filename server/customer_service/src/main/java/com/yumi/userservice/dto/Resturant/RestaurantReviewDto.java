package com.yumi.userservice.dto.Resturant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantReviewDto {
    private String restaurantEmail;
    private String review;
    private float rate;
    private String customerEmail;
    private Long orderId;

}
