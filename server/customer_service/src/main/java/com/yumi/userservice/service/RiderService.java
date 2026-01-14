package com.yumi.userservice.service;

import com.yumi.userservice.dto.Rider.RiderReviewDto;
import com.yumi.userservice.mapper.RiderMapper;
import com.yumi.userservice.model.RiderReview;
import com.yumi.userservice.repository.RiderRepository;
import com.yumi.userservice.service.grpcClient.RiderRatingClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class RiderService {
    @Autowired
    private RiderRepository riderRepository;
    @Autowired
    private RiderMapper RiderMapper;

    @Autowired
    private RiderRatingClient riderRatingClient;

    //   Add rider reviews
    @Transactional
    public void saveReview(RiderReviewDto dto) {
        RiderReview review = RiderMapper.toEntity(dto);
        System.out.println("Saving review: " + review);
        riderRepository.save(review);
        float avgRating = riderRepository.getAverageRatingByRiderEmail(dto.getRiderEmail());
        String grpcResponse = riderRatingClient.UpdateRiderRating(dto.getRiderEmail(), avgRating);
        System.out.println("Rider rating updated via gRPC: " + grpcResponse);
    }

    public List<RiderReviewDto> getByEmail(String riderEmail) {
        return riderRepository.findByRiderEmail(riderEmail)
        .stream()
                .map(RiderMapper::toDto)
                .toList();
    }
    public  RiderReviewDto getRiderReviewbyorderid(Long orderId) {
        return riderRepository.findById(orderId)
                .map(RiderMapper::toDto)
                .orElse(null);
    }

}
