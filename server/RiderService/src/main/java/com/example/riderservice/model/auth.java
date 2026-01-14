package com.example.riderservice.model;


import com.example.riderservice.enums.Rider_status;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "t_auth")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class auth {

    // Getters and setters
    @Id
    private String email;

    private String password;
    @Enumerated(EnumType.STRING)
    private Rider_status status;

    @OneToOne(mappedBy = "auth", cascade = CascadeType.ALL)
    private rider rider;

}
