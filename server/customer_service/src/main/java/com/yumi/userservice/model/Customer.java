package com.yumi.userservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_customer")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
    @Id
    @Column(name="email", nullable = false)
    private String email;

    @Column(nullable = true)
    private String first_name;

    private  String last_name;

    @Column(nullable = true)
    private String phone_number;

    @Column(nullable = true)
    private String location_lat;

    @Column(nullable = true)
    private String location_lng;
    @Column (nullable = false)
    private String img_url;

    @Column (nullable = false)
    private LocalDateTime created_at;

    @Column (nullable = false)
    private LocalDateTime updated_at;

    @PrePersist
    protected void onCreate(){
        created_at= LocalDateTime.now();
        updated_at=LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate(){
        updated_at=LocalDateTime.now();
    }

    @OneToOne
    @JoinColumn(name = "auth_email", referencedColumnName = "auth_email", nullable = true)
    private Auth auth;

}
