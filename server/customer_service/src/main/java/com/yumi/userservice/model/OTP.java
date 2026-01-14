package com.yumi.userservice.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;;
import java.util.Date;

@Entity
@Table (name="x_otp")
@Data
public class OTP {

        @Id
        @Column(name="otp_id")
        @GeneratedValue(strategy=GenerationType.IDENTITY)
        private Long id;

        @Column(name="email", nullable=false)
        private String email;  // PK, only one token per email

        @Getter
        @Setter
        @Column(nullable=false)
        private String otp;

        @Getter
        @Setter
        @Temporal(TemporalType.TIMESTAMP)
        @Column(nullable=false)
        private Date expiryDate;

        @Getter
        @Setter
        @Enumerated(EnumType.STRING)
        private Purpose purpose;

        public enum Purpose{
                RESET_PASSWORD,
                VERIFY_EMAIL
        }
}
