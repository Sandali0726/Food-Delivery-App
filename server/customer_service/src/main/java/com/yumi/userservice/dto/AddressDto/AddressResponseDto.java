package com.yumi.userservice.dto.AddressDto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponseDto {
    private Long id;
    private String email;
    private String label;
    private String address;
    private String lat;
    private String lng;

}
