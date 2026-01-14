package com.yumi.userservice.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "t_auth")
public class Auth {

    @Id
    @Email(message="Invalid email format")
    @NotBlank(message="Email is required")
    @Column(name = "auth_email", nullable = false,unique=true)
    private String email;


    @Column(name = "password")
    private String password;

    @Column(name = "auth_provider")
    private String authProvider;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @OneToOne(mappedBy = "auth", cascade = CascadeType.ALL, orphanRemoval = true)
    private Customer customer;

    @OneToMany(mappedBy = "auth", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Address> addresses;

}
