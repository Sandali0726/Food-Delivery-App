package com.restaurant_service.controller;

import com.restaurant_service.dto.DeliveryRequestLogCreateDto;
import com.restaurant_service.dto.DeliveryRequestLogResponseDto;
import com.restaurant_service.service.DeliveryRequestLogService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/delivery-requests")
public class DeliveryRequestLogController {

    private final DeliveryRequestLogService service;

    public DeliveryRequestLogController(DeliveryRequestLogService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<DeliveryRequestLogResponseDto> create(@Valid @RequestBody DeliveryRequestLogCreateDto dto) {
        var created = service.create(dto);
        URI location = URI.create("/api/delivery-requests/" + created.getRequestId());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryRequestLogResponseDto> getById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<DeliveryRequestLogResponseDto>> listByOrderId(@RequestParam(value = "orderId", required = false) Long orderId,
                                                                              @RequestParam(value = "restaurantEmail", required = false) String restaurantEmail) {
        if (orderId != null) return ResponseEntity.ok(service.listByOrderId(orderId));
       // if (restaurantEmail != null) return ResponseEntity.ok(service.listByRestaurantEmail(restaurantEmail));
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/restaurant")
    public ResponseEntity<Page<DeliveryRequestLogResponseDto>> listByRestaurantEmailPath(
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        return ResponseEntity.ok(service.listByRestaurantEmail(pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
