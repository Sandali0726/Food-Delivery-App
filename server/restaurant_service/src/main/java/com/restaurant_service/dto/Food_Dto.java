package com.restaurant_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Food_Dto {

    private Long categoryId;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean available;
    private String imageUrl;
}
