package com.restaurant_service.controller;

import com.restaurant_service.dto.Food_Dto;
import com.restaurant_service.dto.Food_get_dto;
import com.restaurant_service.model.Food_Item;
import com.restaurant_service.service.Food_Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/foods")
public class Food_Controller {

    private final Food_Service foodService;

    public Food_Controller(Food_Service foodService) {
        this.foodService = foodService;
    }

    @PostMapping
    public ResponseEntity<?> createFood(@RequestBody Food_Dto dto) {
        return foodService.createFoodItem(dto);
    }

    // Support pagination: ?page=0&size=20 (defaults provided)
    @GetMapping
    public Page<Food_get_dto> listFoods(@RequestParam(value = "page", required = false, defaultValue = "0") int page,
                                        @RequestParam(value = "size", required = false, defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        return foodService.getFoodItemsForRestaurant(pageable);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFood(@PathVariable Long id) {
        foodService.deleteFoodItem(id);
        return ResponseEntity.ok("Deleted");
    }

    @PutMapping("/{id}")
    public Food_Item updateFood(@PathVariable Long id, @RequestBody Food_Dto dto) {
        return foodService.updateFoodItem(id, dto);
    }

    @GetMapping("/p-foods")
    public Page<Food_get_dto> listFoods(@RequestParam("email") String restaurantEmail,
                                       @RequestParam(value = "page", required = false, defaultValue = "0") int page,
                                       @RequestParam(value = "size", required = false, defaultValue = "20") int size) {
        if (restaurantEmail == null || restaurantEmail.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing required query parameter: email");
        }
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        return foodService.getFoodItems(restaurantEmail, pageable);
    }

    @GetMapping("/image")
    public ResponseEntity<?>  getFoodimage(@RequestParam("id") Long id) {
        return foodService.getFoodImageUrl(id);
    }
}
