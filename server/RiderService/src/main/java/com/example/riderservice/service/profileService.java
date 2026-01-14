package com.example.riderservice.service;

import com.example.riderservice.dto.DeliveryStaticsDto;
import com.example.riderservice.dto.profileDto;
import com.example.riderservice.enums.Delivery_status;
import com.example.riderservice.enums.Rider_status;
import com.example.riderservice.mapper.profileMapper;
import com.example.riderservice.model.auth;
import com.example.riderservice.model.rider;
import com.example.riderservice.repository.authRepository;
import com.example.riderservice.repository.delivery_taskRepository;
import com.example.riderservice.repository.riderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class profileService {

    private final riderRepository riderRepository;
    private final profileMapper profileMapper;
    private final authRepository authRepository;
    private final delivery_taskRepository deliveryTaskRepository;

    public profileDto getProfile(String email){

        rider rider  = riderRepository.findByEmail(email);
        return profileMapper.toDto(rider);
    }


    public profileDto updateProfile(profileDto riderDetails){


        rider existingRider = riderRepository.findByEmail(riderDetails.getEmail());

        if(existingRider == null){
            throw new IllegalArgumentException("Rider with email " + riderDetails.getEmail() + " not found.");
        }
        try {
            existingRider.setFirst_name(riderDetails.getFirst_name());
            existingRider.setLast_name(riderDetails.getLast_name());
            existingRider.setPhone_number(riderDetails.getPhone_number());
            existingRider.setAddress(riderDetails.getAddress());
            if(riderDetails.getImg_url() != null){
                existingRider.setImg_url(riderDetails.getImg_url());
            }
            existingRider.setLicence(riderDetails.getLicence());
            existingRider.setVehicle_no(riderDetails.getVehicle_no());
            existingRider.setUpdated_at(LocalDateTime.now());
        }catch(Exception e){
            throw new IllegalArgumentException("Error updating rider profile: " + e.getMessage());
        }

        rider response =  riderRepository.save(existingRider);
        return profileMapper.toDto(response);
    }

    public String changeStatus(String email){
        auth existingRider = authRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Rider with email " + email + " not found."));

        if(existingRider == null){
            throw new IllegalArgumentException("Rider with email " + email + " not found.");
        }

        if(existingRider.getStatus().equals(Rider_status.AVAILABLE)){
            existingRider.setStatus(Rider_status.UNAVAILABLE);
        }else{
            existingRider.setStatus(Rider_status.AVAILABLE);
        }
        authRepository.save(existingRider);
        return "Status changed to " + existingRider.getStatus();
    }

    public DeliveryStaticsDto getDeliveryStatistics(String email) {

        LocalDate today = LocalDate.now();
        LocalDate startOfDay = LocalDate.now().with(DayOfWeek.MONDAY);

        BigDecimal completionRate = BigDecimal.ZERO;
        BigDecimal avgEarn = BigDecimal.ZERO;

         Long deliveryCount = deliveryTaskRepository.countByStatusAndRiderEmail(Delivery_status.DELIVERED,email);
         BigDecimal earn = deliveryTaskRepository.sumDeliveryPriceByStatus(Delivery_status.DELIVERED,email);

         Long deliveryCountToday = deliveryTaskRepository.countByStatusAndRiderEmailAndDeliveredAtBetween(Delivery_status.DELIVERED, email,today.atStartOfDay(), today.plusDays(1).atStartOfDay());
         BigDecimal earnToday = deliveryTaskRepository.sumDeliveryPriceByStatusAndDeliveredAtBetween(Delivery_status.DELIVERED, today.atStartOfDay(), today.plusDays(1).atStartOfDay(),email);

         Long deliveryCountWeek = deliveryTaskRepository.countByStatusAndRiderEmailAndDeliveredAtBetween(Delivery_status.DELIVERED, email, startOfDay.atStartOfDay(), today.plusDays(7).atStartOfDay());
         BigDecimal earnWeek = deliveryTaskRepository.sumDeliveryPriceByStatusAndDeliveredAtBetween(Delivery_status.DELIVERED, startOfDay.atStartOfDay(), today.plusDays(7).atStartOfDay(),email);

         long totalTasks = deliveryTaskRepository.countByRiderEmail(email);

         if(deliveryCount != null && deliveryCount > 0 && totalTasks > 0 && earn != null){

              completionRate = BigDecimal.valueOf(deliveryCount)
                     .divide(BigDecimal.valueOf(totalTasks), 2, RoundingMode.HALF_UP)
                     .multiply(BigDecimal.valueOf(100));
              avgEarn = earn.divide(BigDecimal.valueOf(deliveryCount), 2, RoundingMode.HALF_UP);

         }

                return  DeliveryStaticsDto.builder()
                        .totalDeliveries(deliveryCount)
                        .totalEarnings(earn)
                        .totalEarningsToday(earnToday)
                        .totalDeliveriesToday(deliveryCountToday)
                        .totalDeliveriesThisWeek(deliveryCountWeek)
                        .totalEarningsThisWeek(earnWeek)
                        .completionRate(completionRate)
                        .averageEarningsPerDelivery(avgEarn)
                        .build();

    }

    public String getStatus(String email){
        auth existingRider = authRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Rider with email " + email + " not found."));

        if(existingRider == null){
            throw new IllegalArgumentException("Rider with email " + email + " not found.");
        }

        return existingRider.getStatus().name();
    }


}