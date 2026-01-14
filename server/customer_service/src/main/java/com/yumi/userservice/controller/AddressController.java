package com.yumi.userservice.controller;

import com.yumi.userservice.dto.AddressDto.AddressRequestDto;
import com.yumi.userservice.dto.AddressDto.AddressResponseDto;
import com.yumi.userservice.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "http://localhost:3000")
public class AddressController {

    @Autowired
    private  AddressService addressService;

    @PostMapping("/user/{email}")
    public ResponseEntity<AddressResponseDto> saveAddress(
            @PathVariable String email,
            @RequestBody AddressRequestDto dto) {

        return ResponseEntity.ok(addressService.save(email, dto));
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<AddressResponseDto>> getAllAddresses(
            @PathVariable String email) {

        List<AddressResponseDto> responses = addressService.getByEmail(email);
        if (responses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        addressService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
