package com.restaurant_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "t_restaurant_profile")
public class Resturant_Profile {

    @Id
    @Column(name = "email", nullable = false, unique = true)
    private String id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "email", referencedColumnName = "email")
    private Auth_User authUser;

    @Column( name =  "name", nullable = false)
    private  String name;

    @Column( name =  "contact", nullable = false)
    private Long  contactNumber;

    @Column(name = "cover_image_url", updatable = true)
    private String coverImageUrl;

    @Column(name = "profile_image_url", updatable = true)
    private String profileImageUrl;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "latitude", precision = 10, scale = 7)
    private java.math.BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private java.math.BigDecimal longitude;

    @Column(name = "is_open", nullable = false)
    private boolean open;

    @CreationTimestamp
    @Column( name = "created_at", nullable = false , updatable = false)
    private LocalDateTime createdAt;

    @Version
    @Column(name = "version")
    private Long version;


}
