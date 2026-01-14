package com.yumi.userservice.dto.Rider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiderReviewDto {

    private String riderEmail;
    private String review;
    private float rate;
    private String customerEmail;
    private Long orderId;
    //private LocalDateTime created_at;
}
