package com.restaurant_service.service;

import com.restaurant_service.dto.Food_Dto;
import com.restaurant_service.dto.Food_get_dto;
import com.restaurant_service.mapper.Food_Mapper;
import com.restaurant_service.model.Food_Item;
import com.restaurant_service.model.Resturant_Profile;
import com.restaurant_service.repository.Food_Repository;
import com.restaurant_service.repository.Menu_Repository;
import com.restaurant_service.repository.Restaurant_Profile_Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class Food_Service {

    private final Food_Repository foodRepository;
    private final Menu_Repository menuRepository;
    private final Food_Mapper foodMapper;
    private final Restaurant_Profile_Repository restaurantProfileRepository;

    public Food_Service(Food_Repository foodRepository,
                        Menu_Repository menuRepository,
                        Food_Mapper foodMapper,
                        Restaurant_Profile_Repository restaurantProfileRepository) {
        this.foodRepository = foodRepository;
        this.menuRepository = menuRepository;
        this.foodMapper = foodMapper;
        this.restaurantProfileRepository = restaurantProfileRepository;
    }

    public ResponseEntity<?> createFoodItem(Food_Dto dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth instanceof AnonymousAuthenticationToken) {
                throw new AccessDeniedException("User is not authenticated");
            }
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String email = userDetails.getUsername();

            Food_Item entity = foodMapper.toEntity(dto);
            // load existing restaurant profile (must be managed) instead of attaching a transient instance
            Resturant_Profile restaurant = restaurantProfileRepository
                    .findById(email)
                    .orElseThrow(() -> new RuntimeException("Restaurant profile not found for " + email));

            entity.setRestaurant(restaurant);

            // if category id provided, fetch the full category or rely on mapper's id-only object
            if (dto.getCategoryId() != null) {
                menuRepository.findById(dto.getCategoryId()).ifPresent(entity::setCategory);
            }

            foodRepository.save(entity);
            return ResponseEntity.ok("Food item created successfully");

        } catch (Exception e) {
            throw new RuntimeException("Error creating food item: " + e.getMessage(), e);
        }
    }

    // Paginated version for the authenticated restaurant
    public Page<Food_get_dto> getFoodItemsForRestaurant(Pageable pageable) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth instanceof AnonymousAuthenticationToken) {
                throw new AccessDeniedException("User is not authenticated");
            }
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String restaurantEmail = userDetails.getUsername();

            return foodRepository.findByRestaurant_Id(restaurantEmail, pageable)
                    .map(foodMapper::toDto);

        } catch (Exception e) {
            throw new RuntimeException("Error retrieving food items: " + e.getMessage());
        }
    }

    // Keep the old non-paginated method for compatibility
    public List<Food_get_dto> getFoodItemsForRestaurant() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth instanceof AnonymousAuthenticationToken) {
                throw new AccessDeniedException("User is not authenticated");
            }
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String restaurantEmail = userDetails.getUsername();

            return foodRepository.findByRestaurant_Id(restaurantEmail).stream()
                    .map(foodMapper::toDto)
                    .toList();

        } catch (Exception e) {
            throw new RuntimeException("Error retrieving food items: " + e.getMessage());
        }
    }

    public void deleteFoodItem(Long id) {
        try {
            foodRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting food item: " + e.getMessage());
        }
    }

    public Food_Item updateFoodItem(Long id, Food_Dto dto) {
        try {
            Food_Item existing = foodRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Food item not found"));

            existing.setName(dto.getName());
            existing.setDescription(dto.getDescription());
            existing.setPrice(dto.getPrice());
            existing.setAvailable(dto.isAvailable());

            if (dto.getCategoryId() != null) {
                menuRepository.findById(dto.getCategoryId()).ifPresent(existing::setCategory);
            }

            return foodRepository.save(existing);

        } catch (Exception e) {
            throw new RuntimeException("Error updating food item: " + e.getMessage());
        }
    }

    // Paginated version for public endpoint that accepts restaurant email
    public Page<Food_get_dto> getFoodItems(String restaurantEmail, Pageable pageable) {
        try {

            return foodRepository.findByRestaurant_Id(restaurantEmail, pageable)
                    .map(foodMapper::toDto);

        } catch (Exception e) {
            throw new RuntimeException("Error retrieving food items: " + e.getMessage());
        }
    }

    public List<Food_get_dto> getFoodItems( String restaurantEmail) {
        try {

            return foodRepository.findByRestaurant_Id(restaurantEmail).stream()
                    .map(foodMapper::toDto)
                    .toList();

        } catch (Exception e) {
            throw new RuntimeException("Error retrieving food items: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getFoodImageUrl(Long Id) {
        try {
            Food_Item foodItem = foodRepository.findById(Id)
                    .orElseThrow(() -> new RuntimeException("Food item not found"));

            return ResponseEntity.ok(foodItem.getImageUrl());
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving food image URL: " + e.getMessage());
        }
    }


}
