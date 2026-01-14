package com.yumi.userservice.controller;

import com.yumi.userservice.dto.Rider.RiderDetailsDto;
import com.yumi.userservice.dto.order.OrderDto;
import com.yumi.userservice.service.OrderService;
import com.yumi.userservice.service.grpcClient.riderDetailsClient;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/order")
//@CrossOrigin(
//        origins = "http://localhost:3000",
//        allowedHeaders = {"*"},
//        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS},
//        allowCredentials = "true"
//)
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {
    @Autowired
    private OrderService orderService;
    @Autowired
    private riderDetailsClient riderDetailsClient;

    @PostMapping("/save")
    public ResponseEntity<OrderDto> saveOrder(@Valid @RequestBody OrderDto dto) {
        OrderDto saved = orderService.save(dto);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        orderService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{email}")
    public ResponseEntity<List<OrderDto>> getAllOrders(
            @PathVariable String email) {

        List<OrderDto> responses = orderService.getByEmail(email);
        if (responses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(responses);
    }
    @GetMapping("/byid/{id}")
    public ResponseEntity<OrderDto> getOrderById(
            @PathVariable Long id) {
        OrderDto dto = orderService.getById(id);
        return ResponseEntity.ok(dto);

    }

    @GetMapping("/riderDetails")
    public ResponseEntity<RiderDetailsDto> getRiderDetails(
            @RequestParam String email) {

        RiderDetailsDto dto = riderDetailsClient.getRiderDetails(email);
        return ResponseEntity.ok(dto);

    }

    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<Void> cancelOrderPut(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.noContent().build();
    }

}
