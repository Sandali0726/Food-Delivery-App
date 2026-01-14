package com.yumi.userservice.dto.Rider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class RiderReviewResponseDTO {
     private String riderEmail;
    private String review;
    private float rate;
    private String customerEmail;
    private Long orderId;
    private LocalDateTime createdAt;
}
