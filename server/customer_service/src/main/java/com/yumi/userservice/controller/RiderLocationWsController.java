package com.yumi.userservice.controller;
import com.yumi.userservice.dto.Rider.RiderLocationDTO;
import com.yumi.userservice.service.RiderLocationTracker;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
@Controller
public class RiderLocationWsController {
    private final RiderLocationTracker tracker;
    public RiderLocationWsController(RiderLocationTracker tracker) {
        this.tracker = tracker;
    }
    // Client subscribes to /topic/rider-location/{orderId}
    // Optionally send an immediate snapshot upon subscribe
    @SubscribeMapping("/rider-location/{orderId}")
    public void onSubscribe(@DestinationVariable("orderId") Long orderId) {
        tracker.startTracking(orderId);
        tracker.publishOnce(orderId);
    }
    // Allow clients to explicitly start streaming via /app/rider-location.start with payload orderId
    @MessageMapping("/rider-location.start")
    public void start(@Payload Long orderId, SimpMessageHeaderAccessor headers) {
        tracker.startTracking(orderId);
    }
    // Allow clients to stop streaming via /app/rider-location.stop with payload orderId
    @MessageMapping("/rider-location.stop")
    public void stop(@Payload Long orderId, SimpMessageHeaderAccessor headers) {
        tracker.stopTracking(orderId);
    }
}
