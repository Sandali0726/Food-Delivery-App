package com.yumi.userservice.dto.AddressDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressRequestDto {
    private String email;
    private String label;
    private String address;
    private String lat;
    private String lng;
}
