package com.yumi.userservice.repository;

import com.yumi.userservice.model.RestaurantReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantReviewRepository extends JpaRepository<RestaurantReview, Long> {
     List<RestaurantReview> findByRestaurantEmail(String restaurantEmail);
     @Query("SELECT COALESCE( ROUND(AVG(r.rate),1),0) FROM RestaurantReview r WHERE r.restaurantEmail = :email")
     float getAverageRatingByRestaurantEmail(@Param("email") String email);
}
