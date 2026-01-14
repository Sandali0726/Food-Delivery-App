package com.yumi.userservice.dto.Rider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiderDetailsDto {
    private String rider_name;
    private String rider_phone;
    private String rider_image;
    private String vehicle_no;
    private  String delivery_count;
    private String rating;

}
