package com.example.riderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class currentLocationDto {

    private String email;
    private float current_lat;
    private float current_lng;

}
