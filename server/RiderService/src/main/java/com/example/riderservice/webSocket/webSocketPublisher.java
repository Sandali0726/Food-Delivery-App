package com.example.riderservice.webSocket;


import com.example.riderservice.dto.currentLocationDto;
import com.example.riderservice.dto.socketMessageDto;
import com.example.riderservice.model.order;
import com.example.riderservice.model.rider;
import com.example.riderservice.repository.riderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class webSocketPublisher {
    private final SimpMessagingTemplate messagingTemplate;
    private final riderRepository riderRepository;

    public void sendNewOrder(order order) {

        double RADIUS_METERS = 10000;
        List<rider> nearbyRiders = riderRepository.findNearbyRiders(
                (double) order.getPickupLat(),
                (double) order.getPickupLng(),
                RADIUS_METERS /1000
        );

        System.out.println("Number of nearby riders found: " + nearbyRiders.size());

        for(rider rider : nearbyRiders){
            System.out.println("Rider found within radius:"+nearbyRiders.size());
            System.out.println("Nearby Rider: " + rider.getEmail());
        }

        for (rider rider : nearbyRiders) {
            messagingTemplate.convertAndSendToUser(
                    rider.getEmail(),
                    "/topic/orders",
                    new socketMessageDto<>("ORDER_CREATED", order)

            );
            System.out.println("Publishing new order via WebSocket: " + rider.getEmail());
        }

    }

    public void removeOrder(Long orderId) {
        System.out.println("Removing order via WebSocket: " + orderId);
        messagingTemplate.convertAndSend(
                "/topic/orders",
                new socketMessageDto<>("ORDER_REMOVED", orderId)
        );
    }

    public void sendLocation(String email, float lat, float lng) {
        messagingTemplate.convertAndSend(
                "/topic/locations",
                new socketMessageDto<>("LOCATION_UPDATE", new currentLocationDto(email, lat, lng))
        );
    }

}

