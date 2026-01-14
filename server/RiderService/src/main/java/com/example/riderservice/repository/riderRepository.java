package com.example.riderservice.repository;

import com.example.riderservice.model.rider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface riderRepository extends JpaRepository<rider,String> {

    public rider findByEmail(String email);

    public boolean existsByEmail(String email);


    @Query(value = """
    SELECT r
    FROM rider r
    JOIN r.auth a
    WHERE (6371 * acos(
            cos(radians(:lat)) * cos(radians(r.current_lat)) *
            cos(radians(r.current_lng) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(r.current_lat))
        )) <= :radiusInKm
        AND a.status = 'AVAILABLE'
""")
    public List<rider> findNearbyRiders(double lat, double lng, double radiusInKm);


}
