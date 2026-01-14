package com.example.riderservice.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeliveryStaticsDto {

    private Long totalDeliveriesToday;
    private BigDecimal totalEarningsToday;
    private Long totalDeliveriesThisWeek;
    private BigDecimal totalEarningsThisWeek;
    private Long totalDeliveries;
    private BigDecimal totalEarnings;
    private BigDecimal averageEarningsPerDelivery;
    private BigDecimal completionRate;


}
