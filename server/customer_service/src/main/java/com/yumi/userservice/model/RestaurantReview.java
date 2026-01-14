package com.yumi.userservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
@Entity
@Table(name = "t_resturant_review")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantReview {
    @Id
  @Column(nullable=false)
    private Long orderId;

    @Column(nullable = false)
    private String review;

    @Column(nullable = false)
    private String customerEmail;

    @Column(nullable = false)
    private String restaurantEmail;

    @Column(nullable = false)
    private float rate;

}
