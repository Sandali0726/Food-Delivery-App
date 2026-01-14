package com.restaurant_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name="t_menu_category")
public class Menu_Category {

    @Id
    @SequenceGenerator(name = "rt_seq", sequenceName = "t_refresh_token_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "rt_seq")
    private Long id;

    @Column( name =  "resturrant_mail", nullable = false)
    private String resturrant_mail;

    @Column(name = "name", nullable = false, unique = true)
    private String name;


}
