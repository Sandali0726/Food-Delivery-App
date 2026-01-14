package com.example.riderservice.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class deliveryDetailsHistoryDto extends deliveryDetailsDto {

    private float rating;

}
