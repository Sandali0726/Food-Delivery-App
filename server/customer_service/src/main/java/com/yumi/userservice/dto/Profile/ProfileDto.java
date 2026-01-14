package com.yumi.userservice.dto.Profile;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//complete profile dto
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileDto
{
    private String first_name;
    private  String last_name;
    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(?:\\+94|0)?7[0-9]{8}$",
            message = "Invalid Sri Lankan phone number"
    )
    private String phone_number;
    private String location_lat;
    private String location_lng;
    private String img_url;


}
