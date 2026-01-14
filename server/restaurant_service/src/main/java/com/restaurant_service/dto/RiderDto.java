package com.restaurant_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RiderDto {
    private String riderName;
    private String riderPhone;
    private String riderImage;
    private String vehicleNo;
    private String deliveryCount;
    private String rating;
}

