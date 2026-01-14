package com.restaurant_service.controller;

import com.restaurant_service.dto.RestaurantOrderItemCreateDto;
import com.restaurant_service.dto.RestaurantOrderItemResponseDto;
import com.restaurant_service.service.RestaurantOrderItemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/order-items")
public class RestaurantOrderItemController {

    private final RestaurantOrderItemService service;

    public RestaurantOrderItemController(RestaurantOrderItemService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<RestaurantOrderItemResponseDto> create(@Valid @RequestBody RestaurantOrderItemCreateDto dto) {
        var created = service.create(dto);
        URI location = URI.create("/api/order-items/" + created.getOrderItemId());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantOrderItemResponseDto> getById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<RestaurantOrderItemResponseDto>> listByOrderId(@RequestParam(value = "orderId", required = false) Long orderId) {
        if (orderId != null) {
            return ResponseEntity.ok(service.listByOrderId(orderId));
        }
        return ResponseEntity.ok(List.of());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
