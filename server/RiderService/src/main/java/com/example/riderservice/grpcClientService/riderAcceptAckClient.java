package com.example.riderservice.grpcClientService;

import com.restaurant_service.grpc.AcceptDeliveryRequestRequest;
import com.restaurant_service.grpc.DeliveryAcceptResponse;
import com.restaurant_service.grpc.DeliveryServiceGrpc;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class riderAcceptAckClient {

  private final DeliveryServiceGrpc.DeliveryServiceBlockingStub stub;

  public void sendRiderAcceptAck(Long orderId, String riderEmail) {

    AcceptDeliveryRequestRequest request = AcceptDeliveryRequestRequest.newBuilder()
            .setOrderId(orderId)
            .setDeliveryId(riderEmail)
            .build();

    DeliveryAcceptResponse response = stub.acceptDeliveryRequest(request);
    System.out.println("🏍️ Rider Accept Ack response: " + response.getMessage());
  }


}
