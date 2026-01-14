package com.yumi.userservice.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import net.minidev.json.annotate.JsonIgnore;

@Entity
@Table(name = "t_address")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String lat;

    @Column(nullable = false)
    private String lng;

    // Mapping to Auth entity
    @ManyToOne(fetch = FetchType.LAZY)  // Lazy loading is recommended
    @JsonBackReference
    @JoinColumn(name = "email", referencedColumnName = "auth_email", nullable = false)
    private Auth auth;

    public void setEmail(String email) {
        if (this.auth == null) {
            this.auth = new Auth();
        }
        this.auth.setEmail(email);
    }

}
