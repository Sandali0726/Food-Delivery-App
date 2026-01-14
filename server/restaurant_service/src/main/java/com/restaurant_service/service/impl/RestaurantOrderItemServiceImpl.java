package com.restaurant_service.service.impl;

import com.restaurant_service.dto.RestaurantOrderItemCreateDto;
import com.restaurant_service.dto.RestaurantOrderItemResponseDto;
import com.restaurant_service.mapper.RestaurantOrderItemMapper;
import com.restaurant_service.model.RestaurantOrderItem;
import com.restaurant_service.repository.RestaurantOrderItemRepository;
import com.restaurant_service.service.RestaurantOrderItemService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class RestaurantOrderItemServiceImpl implements RestaurantOrderItemService {

    private final RestaurantOrderItemRepository repository;
    private final RestaurantOrderItemMapper mapper;

    public RestaurantOrderItemServiceImpl(RestaurantOrderItemRepository repository,
                                          RestaurantOrderItemMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public RestaurantOrderItemResponseDto create(RestaurantOrderItemCreateDto dto) {
        RestaurantOrderItem entity = mapper.toEntity(dto);
        RestaurantOrderItem saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public RestaurantOrderItemResponseDto getById(UUID id) {
        RestaurantOrderItem e = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order item not found: " + id));
        return mapper.toDto(e);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantOrderItemResponseDto> listByOrderId(Long orderId) {
        return repository.findByOrderId(orderId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Order item not found: " + id);
        }
        repository.deleteById(id);
    }
}
