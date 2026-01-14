package com.restaurant_service.service.impl;

import com.restaurant_service.dto.DeliveryRequestLogCreateDto;
import com.restaurant_service.dto.DeliveryRequestLogResponseDto;
import com.restaurant_service.enums.DeliveryRequestStatus;
import com.restaurant_service.mapper.DeliveryRequestLogMapper;
import com.restaurant_service.model.DeliveryRequestLog;
import com.restaurant_service.model.RestaurantOrder;
import com.restaurant_service.repository.DeliveryRequestLogRepository;
import com.restaurant_service.service.DeliveryRequestLogService;
import com.restaurant_service.service.Profile_Service;
import com.restaurant_service.service.producer.OrderEventProducer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DeliveryRequestLogServiceImpl implements DeliveryRequestLogService {

    private final DeliveryRequestLogRepository repository;
    private final DeliveryRequestLogMapper mapper;
    private final Profile_Service profileService;
    private final OrderEventProducer orderEventProducer;

    public DeliveryRequestLogServiceImpl(DeliveryRequestLogRepository repository,
                                         DeliveryRequestLogMapper mapper,
                                         Profile_Service profileService,
                                         OrderEventProducer orderEventProducer) {
        this.repository = repository;
        this.mapper = mapper;
        this.profileService = profileService;
        this.orderEventProducer = orderEventProducer;
    }

    @Override
    public DeliveryRequestLogResponseDto create(DeliveryRequestLogCreateDto dto) {
        DeliveryRequestLog entity = mapper.toEntity(dto);
        DeliveryRequestLog saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryRequestLogResponseDto getById(UUID id) {
        DeliveryRequestLog e = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Delivery request not found: " + id));
        return mapper.toDto(e);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryRequestLogResponseDto> listByOrderId(Long orderId) {
        return repository.findByOrderId(orderId).stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryRequestLogResponseDto> listByRestaurantEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException("User is not authenticated");
        }
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        String id = userDetails.getUsername();
        return repository.findByRestaurantEmail(id).stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DeliveryRequestLogResponseDto> listByRestaurantEmail(Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException("User is not authenticated");
        }
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        String id = userDetails.getUsername();
        return repository.findByRestaurantEmail(id, pageable).map(mapper::toDto);
    }

    @Override
    public void delete(UUID id) {
        if (!repository.existsById(id)) throw new IllegalArgumentException("Delivery request not found: " + id);
        repository.deleteById(id);
    }

    @Override
    public void createForOrderReady(RestaurantOrder order) {
        // Fetch restaurant pickup location
        var restaurantLocation = profileService.getRestaurantLocation(order.getRestaurantEmail());
        if (restaurantLocation == null) {
            throw new IllegalStateException("Restaurant location not found for: " + order.getRestaurantEmail());
        }

        // Build and persist DeliveryRequestLog with REQUESTED status and null deliveryId
        DeliveryRequestLog log = DeliveryRequestLog.builder()
                .orderId(order.getOrderId())
                .restaurantEmail(order.getRestaurantEmail())
                .clientId(order.getCustomerId())
                .pickupLat(restaurantLocation.getLatitude())
                .pickupLng(restaurantLocation.getLongitude())
                .dropLat(order.getDropLat())
                .dropLng(order.getDropLng())
                .status(DeliveryRequestStatus.REQUESTED)
                .deliveryId(null)
                .price(order.getTotalAmount())
                .otp(order.getOtp())
                .build();

        DeliveryRequestLog saved = repository.save(log);

        // Immediately publish Kafka event using DeliveryRequestLog payload
        orderEventProducer.publishOrderReady(saved);
    }

    @Override
    public void updateStatusByOrderId(Long orderId, DeliveryRequestStatus status) {
        List<DeliveryRequestLog> logs = repository.findByOrderId(orderId);
        if (logs == null || logs.isEmpty()) {
            throw new IllegalArgumentException("No delivery request logs found for orderId: " + orderId);
        }

        for (DeliveryRequestLog log : logs) {
            log.setStatus(status);
            // if terminal statuses require clearing deliveryId or other side effects, handle here
            repository.save(log);
            // publish an event for status change; reuse ORDER_READY topic for now but include status
            orderEventProducer.publishOrderReady(log);
        }
    }
}
