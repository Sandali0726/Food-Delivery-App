package com.example.riderservice.grpcClientService;

import com.example.grpc.RiderEmailRequest;
import com.example.grpc.RiderEmailResponse;
import com.example.grpc.RiderEmailServiceGrpc;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RiderEmailToCustomerClent {

   private final RiderEmailServiceGrpc.RiderEmailServiceBlockingStub stub;

   public String sendRiderEmailToCustomer(Long orderId, String riderEmail) {

     RiderEmailRequest request = com.example.grpc.RiderEmailRequest.newBuilder()
             .setOrderId(orderId)
             .setRiderEmail(riderEmail)
             .build();

     RiderEmailResponse response = stub.getRiderEmail(request);
     return  "🏍️ Rider Email to Customer response: " + response.getMessage();
   }


}
