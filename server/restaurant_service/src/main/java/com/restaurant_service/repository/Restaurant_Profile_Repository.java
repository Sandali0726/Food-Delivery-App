package com.restaurant_service.repository;

import com.restaurant_service.model.Resturant_Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Restaurant_Profile_Repository extends JpaRepository<Resturant_Profile, String> {

}
