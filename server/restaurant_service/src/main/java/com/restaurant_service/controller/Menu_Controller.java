package com.restaurant_service.controller;

import com.restaurant_service.dto.Menu_Dto;
import com.restaurant_service.dto.Menu_category_get_dto;
import com.restaurant_service.model.Menu_Category;
import com.restaurant_service.service.Menu_Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/menu")
public class Menu_Controller {


    private final Menu_Service menu_Service;
    private static final Logger logger = LoggerFactory.getLogger(Menu_Controller.class);

    public Menu_Controller(Menu_Service menu_Service) {
        this.menu_Service = menu_Service;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createMenu(@RequestBody Menu_Dto menuDto) {
        logger.info("createMenu called by principal (if authenticated) to create menu name={}", menuDto.getName());
        return menu_Service.createMenuCategory(menuDto);
    }

    @GetMapping("/get")
    public ResponseEntity<List<Menu_Category>> getMenuCategoriesByRestaurant() {
        List<Menu_Category> categories = menu_Service.getMenuCategoriesByRestaurant();
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateMenuCategory(@RequestBody Menu_category_get_dto menuDto) {
        logger.info("updateMenuCategory called for id={} name={}", menuDto.getId(), menuDto.getName());
        Menu_Category updated = menu_Service.updateMenuCategory(menuDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteMenuCategory(@RequestBody Menu_category_get_dto menuDto) {
        logger.info("deleteMenuCategory called for id={}", menuDto.getId());
        menu_Service.deleteMenuCategory(menuDto);
        return ResponseEntity.ok("Menu category deleted successfully");
    }

    @GetMapping("/p-getcategories")
    public ResponseEntity<List<Menu_Category>> getAllMenuCategories(@RequestParam("email") String restaurantEmail) {
        logger.info("getAllMenuCategories called for restaurantEmail={}", restaurantEmail);
        List<Menu_Category> categories = menu_Service.getMenuCategoriesByRestaurantpub(restaurantEmail);
        return ResponseEntity.ok(categories);
    }

}
