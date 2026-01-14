package com.restaurant_service.service.impl;

import com.restaurant_service.dto.RestaurantOrderCreateDto;
import com.restaurant_service.dto.RestaurantOrderResponseDto;
import com.restaurant_service.dto.RevenueResponseDto;
import com.restaurant_service.exception.OrderNotFoundException;
import com.restaurant_service.mapper.RestaurantOrderMapper;
import com.restaurant_service.model.OrderStatus;
import com.restaurant_service.model.RestaurantOrder;
import com.restaurant_service.repository.RestaurantOrderRepository;
import com.restaurant_service.service.DeliveryRequestLogService;
import com.restaurant_service.service.RestaurantOrderService;
import com.restaurant_service.service.producer.OrderStatusEventProducer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class RestaurantOrderServiceImpl implements RestaurantOrderService {

    private static final BigDecimal RESTAURANT_SHARE = BigDecimal.valueOf(0.925);

    private final RestaurantOrderRepository repository;

    private final RestaurantOrderMapper mapper;

    private final DeliveryRequestLogService deliveryRequestLogService;

    // added producer to publish status change events
    private final OrderStatusEventProducer orderStatusEventProducer;

    public RestaurantOrderServiceImpl(RestaurantOrderRepository repository,
                                      RestaurantOrderMapper mapper,
                                      DeliveryRequestLogService deliveryRequestLogService,
                                      OrderStatusEventProducer orderStatusEventProducer) {
        this.repository = repository;
        this.mapper = mapper;
        this.deliveryRequestLogService = deliveryRequestLogService;
        this.orderStatusEventProducer = orderStatusEventProducer;
    }

    @Override
    public RestaurantOrderResponseDto create(RestaurantOrderCreateDto dto) {
        // simply persist the provided data as local copy
        RestaurantOrder e = mapper.toEntity(dto);
        e.setStatus(OrderStatus.NEW);
        RestaurantOrder saved = repository.save(e);
        return mapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public RestaurantOrderResponseDto getById(Long id) {
        Objects.requireNonNull(id, "id must not be null");
        RestaurantOrder e = repository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
        return mapper.toDto(e);
    }

    // helper to get authenticated restaurant email
    private String getAuthenticatedRestaurantEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException("User is not authenticated");
        }
        Object principal = auth.getPrincipal();
        if (!(principal instanceof UserDetails)) {
            throw new AccessDeniedException("Unexpected principal type: " + principal.getClass());
        }
        UserDetails userDetails = (UserDetails) principal;
        String email = userDetails.getUsername();
        Objects.requireNonNull(email, "email must not be null");
        return email;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantOrderResponseDto> list(OrderStatus status) {
        String email = getAuthenticatedRestaurantEmail();
        List<RestaurantOrder> list = (status == null)
                ? repository.findByRestaurantEmail(email)
                : repository.findByRestaurantEmailAndStatus(email, status);
        return list.stream().map(mapper::toDto).toList();
    }

    // new paginated listing
    @Override
    @Transactional(readOnly = true)
    public Page<RestaurantOrderResponseDto> list(OrderStatus status, Pageable pageable) {
        String email = getAuthenticatedRestaurantEmail();
        Page<RestaurantOrder> page = (status == null)
                ? repository.findByRestaurantEmail(email, pageable)
                : repository.findByRestaurantEmailAndStatus(email, status, pageable);
        return page.map(mapper::toDto);
    }

    @Override
    public RestaurantOrderResponseDto updateStatus(Long id, OrderStatus status) {
        Objects.requireNonNull(id, "id must not be null");
        RestaurantOrder e = repository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));

        if (e.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot change status of a cancelled order");
        }

        e.setStatus(status);
        RestaurantOrder saved = repository.save(e);

        // publish status change events for ACCEPTED and PREPARING
        if (status == OrderStatus.ACCEPTED) {
            orderStatusEventProducer.publishOrderAccepted(saved);
        } else if (status == OrderStatus.PREPARING) {
            orderStatusEventProducer.publishorderProcessing(saved);
        }

        // When order becomes READY, automatically create DeliveryRequestLog and publish ORDER_READY event
        if (status == OrderStatus.READY) {
            deliveryRequestLogService.createForOrderReady(saved);
            orderStatusEventProducer.publishorderStatusReady(saved);
        }

        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        Objects.requireNonNull(id, "id must not be null");
        if (!repository.existsById(id)) {
            throw new OrderNotFoundException(id);
        }
        repository.deleteById(id);
    }


    @Override
    public List<RestaurantOrderResponseDto> getallOdersByRestaurantId() {
        String email = getAuthenticatedRestaurantEmail();
        List<RestaurantOrder> e = repository.findByRestaurantEmail(email);
        return mapper.toDtoList(e);
    }

    public long getOrdersCount(String restaurantEmail) {
        Objects.requireNonNull(restaurantEmail, "restaurantEmail must not be null");
        return repository.countByRestaurantEmailIgnoreCase(restaurantEmail);
    }

    @Override
    public RevenueResponseDto getRevenueByRestaurantEmail(String restaurantEmail) {
        Objects.requireNonNull(restaurantEmail, "restaurantEmail must not be null");
        BigDecimal gross = repository
                .sumTotalAmountByRestaurantEmailIgnoreCase(restaurantEmail);
        if (gross == null) {
            gross = BigDecimal.ZERO;
        }
        BigDecimal revenue = gross.multiply(RESTAURANT_SHARE)
                .setScale(2, RoundingMode.HALF_UP);
        return RevenueResponseDto.builder()
                .restaurantEmail(restaurantEmail)
                .revenue(revenue)
                .build();
    }
}
