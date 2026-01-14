package com.example.riderservice.controller;


import com.example.riderservice.dto.deliveryDetailsDto;
import com.example.riderservice.dto.deliveryDetailsHistoryDto;
import com.example.riderservice.service.deliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class deliveryController {

    public final deliveryService deliveryService;

    @GetMapping("/api/delivery-tasks/get-by-email")
    public ResponseEntity<?> getDeliveryTasks(@RequestParam String email ){
        try{
            List<deliveryDetailsDto> order = deliveryService.getDeliveryDetailsByEmail(email);
            return ResponseEntity.ok(order);
        }catch(Exception e){
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/api/delivery-tasks/get-delivered-history-by-email")
    public ResponseEntity<?> getDeliveredHistoryByEmail(
            @RequestParam String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String date // expected yyyy-MM-dd
    ){
        try{
            LocalDate parsedDate = null;
            if (date != null) {
                try {
                    parsedDate = LocalDate.parse(date);
                } catch (DateTimeParseException ex) {
                    return ResponseEntity.badRequest().body("Invalid date format. Expected yyyy-MM-dd");
                }
            }
            List<deliveryDetailsHistoryDto> order = deliveryService.getDeliveredHistoryByEmail(email,page,size,orderId,parsedDate);
            return ResponseEntity.ok(order);
        }catch(Exception e){
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/api/delivery-tasks/update-status")
    public ResponseEntity<?> updateDeliveryStatus(@RequestParam Long orderId, @RequestParam String status ){
        try{
            deliveryDetailsDto response = deliveryService.updateStatusOfOrder(orderId, status);
            return ResponseEntity.ok(response);
        }catch(Exception e){
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/api/delivery-tasks/validate-otp")
    public ResponseEntity<?> validateOrderOtp(@RequestParam Long orderId, @RequestParam Long otp ) {
        try {
            String response = deliveryService.validateOrderOtp(orderId, otp);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }


}
