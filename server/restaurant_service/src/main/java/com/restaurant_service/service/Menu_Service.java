package com.restaurant_service.service;

import com.restaurant_service.dto.Menu_Dto;
import com.restaurant_service.dto.Menu_category_get_dto;
import com.restaurant_service.mapper.Menu_Mapper;
import com.restaurant_service.model.Menu_Category;
import com.restaurant_service.repository.Menu_Repository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class Menu_Service {

    private final Menu_Repository menuRepository;

    private final Menu_Mapper menuMapper;

    public Menu_Service(Menu_Repository menuRepository, Menu_Mapper menuMapper) {
        this.menuMapper = menuMapper;
        this.menuRepository = menuRepository;
    }

    public ResponseEntity<?> createMenuCategory(Menu_Dto menuDto) {
        try{
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth instanceof AnonymousAuthenticationToken) {
                throw new AccessDeniedException("User is not authenticated");
            }

            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String email = userDetails.getUsername();
            Menu_Category menuCategory = menuMapper.toEntity(menuDto);
            menuCategory.setResturrant_mail(email);
            menuRepository.save(menuCategory);
            return ResponseEntity.ok("Menu category created successfully");

        } catch (Exception e) {
            throw new RuntimeException("Error creating menu category: " + e.getMessage());
        }

    }
    public List<Menu_Category> getMenuCategoriesByRestaurant() {
        try{
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth instanceof AnonymousAuthenticationToken) {
                throw new AccessDeniedException("User is not authenticated");
            }
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String restaurantEmail  = userDetails.getUsername();
            return menuRepository.findAll().stream()
                    .filter(menu -> menu.getResturrant_mail().equals(restaurantEmail))
                    .toList();

        } catch (Exception e) {
            throw new RuntimeException("Error retrieving menu categories: " + e.getMessage());
        }
    }

    public void deleteMenuCategory(Menu_category_get_dto menuDto) {
        try{
            menuRepository.deleteById(menuDto.getId());

        } catch (Exception e) {
            throw new RuntimeException("Error deleting menu category: " + e.getMessage());
        }
    }

    public Menu_Category updateMenuCategory(Menu_category_get_dto menuDto) {
        try{
            Menu_Category existingCategory = menuRepository.findById(menuDto.getId())
                    .orElseThrow(() -> new RuntimeException("Menu category not found with name: " + menuDto.getName()));

            existingCategory.setName(menuDto.getName());
            return menuRepository.save(existingCategory);

        } catch (Exception e) {
            throw new RuntimeException("Error updating menu category: " + e.getMessage());
        }
    }

    public List<Menu_Category> getMenuCategoriesByRestaurantpub(String restaurantEmail) {
        try{

           return menuRepository.findByRestaurantEmail(restaurantEmail);

        } catch (Exception e) {
            throw new RuntimeException("Error retrieving menu categories: " + e.getMessage());
        }
    }


}
