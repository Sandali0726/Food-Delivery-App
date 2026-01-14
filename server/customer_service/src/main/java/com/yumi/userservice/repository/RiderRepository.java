package com.yumi.userservice.repository;

import com.yumi.userservice.model.RiderReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RiderRepository extends JpaRepository <RiderReview, Long> {
     @Query("SELECT r FROM RiderReview r WHERE r.riderEmail = :rider_email ORDER BY  r.createdAt DESC")
    List<RiderReview> findByRiderEmail(String rider_email);

    @Query("SELECT AVG(r.rate) FROM RiderReview r WHERE r.riderEmail = :email")
    float getAverageRatingByRiderEmail(@Param("email") String email);

}
