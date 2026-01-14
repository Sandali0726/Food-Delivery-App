package com.restaurant_service.repository;

import com.restaurant_service.model.Food_Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Food_Repository extends JpaRepository<Food_Item, Long> {
    List<Food_Item> findByRestaurant_Id(String restaurantEmail);

    // Add pageable variant for pagination support
    Page<Food_Item> findByRestaurant_Id(String restaurantEmail, Pageable pageable);
}
