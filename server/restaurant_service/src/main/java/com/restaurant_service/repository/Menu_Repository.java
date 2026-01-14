package com.restaurant_service.repository;

import com.restaurant_service.model.Menu_Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Menu_Repository extends JpaRepository<Menu_Category, Long> {

        @Query("SELECT m FROM Menu_Category m WHERE m.resturrant_mail = :restaurantEmail")
        List<Menu_Category> findByRestaurantEmail(@Param("restaurantEmail") String restaurantEmail);

}
