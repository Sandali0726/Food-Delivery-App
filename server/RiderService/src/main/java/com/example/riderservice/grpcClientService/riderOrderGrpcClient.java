//package com.example.riderservice.grpcClientService;
//
//
//import com.example.grpc.RestaurantOrderServiceGrpc;
//import com.example.grpc.UpdateOrderStatusRequest;
//import com.example.grpc.UpdateOrderStatusResponse;
//import io.grpc.ManagedChannel;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//@Service
//public class riderOrderGrpcClient {
//
//   private final RestaurantOrderServiceGrpc.RestaurantOrderServiceBlockingStub stub;
//
//   public riderOrderGrpcClient(ManagedChannel channel) {
//      this.stub = RestaurantOrderServiceGrpc.newBlockingStub(channel);
//   }
//
//   public void acceptOrder(Long orderId) {
//      // Implementation for accepting an order via gRPC
//      // You can build and send a request to the restaurant service here
//
//      UpdateOrderStatusRequest request = UpdateOrderStatusRequest.newBuilder()
//              .setOrderId(orderId)
//              .setStatus("PICKED_UP")
//              .build();
//
//      UpdateOrderStatusResponse response = stub.updateOrderStatus(request);
//      System.out.println("🚗 Rider received response: " + response.getMessage());
//
//
//   }
//
//}
