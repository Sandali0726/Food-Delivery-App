package com.restaurant_service.controller;

import com.restaurant_service.dto.RestaurantOrderCreateDto;
import com.restaurant_service.dto.RestaurantOrderResponseDto;
import com.restaurant_service.dto.RestaurantOrderStatusUpdateDto;
import com.restaurant_service.dto.RevenueResponseDto;
import com.restaurant_service.model.OrderStatus;
import com.restaurant_service.service.RestaurantOrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class RestaurantOrderController {

    private final RestaurantOrderService service;

    public RestaurantOrderController(RestaurantOrderService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<RestaurantOrderResponseDto> create(@Valid @RequestBody RestaurantOrderCreateDto dto) {
        var created = service.create(dto);
        URI location = URI.create("/api/orders/" + created.getOrderId());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantOrderResponseDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // pageable list endpoint: supports optional status filter
    @GetMapping
    public ResponseEntity<Page<RestaurantOrderResponseDto>> list(@RequestParam(value = "status", required = false) OrderStatus status,
                                                                 @RequestParam(value = "page", required = false, defaultValue = "0") int page,
                                                                 @RequestParam(value = "size", required = false, defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<RestaurantOrderResponseDto> result = service.list(status, pageable);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RestaurantOrderResponseDto> updateStatus(@PathVariable("id") Long id,
                                                                    @Valid @RequestBody RestaurantOrderStatusUpdateDto dto) {
        return ResponseEntity.ok(service.updateStatus(id, dto.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> countOrdersForRestaurant(@RequestParam String restaurantEmail) {
        long count = service.getOrdersCount( restaurantEmail );
        return ResponseEntity.ok(Map.of("orderCount", count));
    }

    @GetMapping("/revenue")
    public ResponseEntity<RevenueResponseDto> getRevenue(@RequestParam String restaurantEmail) {
        return ResponseEntity.ok(service.getRevenueByRestaurantEmail(restaurantEmail));
    }
}
