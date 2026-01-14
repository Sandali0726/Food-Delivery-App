package com.yumi.userservice.dto.Rider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiderLocationDTO {

    private Long orderId;
    private float lat;
    private float lng;
}
