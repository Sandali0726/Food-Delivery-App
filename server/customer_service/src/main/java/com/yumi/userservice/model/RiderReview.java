package com.yumi.userservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "t_rider_review")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiderReview {
    @Id
    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private String riderEmail;

    private String review;

    @Column(nullable = false)
    private String customerEmail;//customer email

    @Column(nullable = false)
    private float rate;

    @CreationTimestamp
    @Column (nullable = false)
    private LocalDateTime createdAt;

//    @PrePersist
//    protected void onCreate(){
//        created_at= LocalDateTime.now();
//    }

}
