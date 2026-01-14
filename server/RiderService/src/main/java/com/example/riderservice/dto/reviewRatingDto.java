package com.example.riderservice.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class reviewRatingDto {

    private String customerEmail;
    private String review;
    private float rating;
    private Long orderId;
    private Instant createdAt;

}
