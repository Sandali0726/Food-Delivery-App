package com.yumi.userservice.service;

import com.yumi.userservice.dto.Resturant.RestaurantReviewDto;
import com.yumi.userservice.mapper.RestaurantMapper;
import com.yumi.userservice.model.RestaurantReview;
import com.yumi.userservice.repository.RestaurantReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class RestaurantService {
    @Autowired
    private RestaurantReviewRepository restaurantRepository;
    @Autowired
    private RestaurantMapper restaurantMapper;

    @Transactional
    public void saveReview(RestaurantReviewDto dto) {
        RestaurantReview review = restaurantMapper.toEntity(dto);
        restaurantRepository.save(review);
    }
    public List<RestaurantReviewDto> getByEmail(String restaurantEmail) {
        return restaurantRepository.findByRestaurantEmail(restaurantEmail)
                .stream()
                .map(restaurantMapper::toDto)
                .toList();
    }
    public List<RestaurantReviewDto> getAllReviews() {
        return restaurantRepository.findAll()
                .stream()
                .map(restaurantMapper::toDto)
                .toList();
    }
    public float getAverageRating(String restaurantEmail) {
        return restaurantRepository.getAverageRatingByRestaurantEmail(restaurantEmail);
    }

    public RestaurantReviewDto getRestaurantReviewByOrderId(Long orderId) {
        return restaurantRepository.findById(orderId)
                .map(restaurantMapper::toDto)
                .orElse(null);
    }


}
