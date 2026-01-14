package com.example.riderservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "x_delivery_log")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class delivery_log {

    @Id
    @GeneratedValue(generator = "uuid2")
//    @GenericGenerator(name = "uuid2", strategy = "uuid2")
//    @Column(columnDefinition = "uuid")
    private UUID log_id;
    private float lat;
    private float lng;

    @ManyToOne
    @JoinColumn (name = "email")
    private rider rider;
}
