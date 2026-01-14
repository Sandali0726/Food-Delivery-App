package com.example.riderservice.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "t_rider")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class rider {

    @Id
    private String email;
    private String first_name;
    private String last_name;
    private String phone_number;
    private String address;
    private String img_url;
    private float current_lat;
    private float current_lng;
    @CreationTimestamp
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
    private String licence;
    private String vehicle_no;
    @Column(nullable = true)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "email", referencedColumnName = "email")
    private auth auth;

    @OneToMany (mappedBy = "rider")
    @Builder.Default
    private List<delivery_task> deliveryTasks = new ArrayList<>();

    @OneToMany(mappedBy = "rider")
    @Builder.Default
    private List<delivery_log> deliveryLogs = new ArrayList<>();


}
