package com.restaurant_service.controller;

import com.restaurant_service.dto.RiderDto;
import com.restaurant_service.service.RiderClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/riders")
public class RiderController {

    private final RiderClientService riderClientService;

    public RiderController(RiderClientService riderClientService) {
        this.riderClientService = riderClientService;
    }

    @GetMapping("/{email}")
    public ResponseEntity<RiderDto> getRiderByEmail(@PathVariable("email") String email) {
        RiderDto dto = riderClientService.getRiderDetailsByEmail(email);
        return ResponseEntity.ok(dto);
    }
}

