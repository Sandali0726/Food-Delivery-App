package com.yumi.userservice.service.grpc;

import com.example.grpc.RiderEmailRequest;
import com.example.grpc.RiderEmailResponse;
import com.example.grpc.RiderEmailServiceGrpc;
import com.yumi.userservice.model.Order;
import com.yumi.userservice.repository.OrderRepository;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.grpc.server.service.GrpcService;

@GrpcService
public class RiderEmailImpl extends RiderEmailServiceGrpc.RiderEmailServiceImplBase {
    @Autowired
    private OrderRepository orderRepository;

    @Override
    public void getRiderEmail(RiderEmailRequest request, StreamObserver<RiderEmailResponse> responseObserver) {
        try {
            long orderId = request.getOrderId();
            String riderEmail = request.getRiderEmail();
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));
            order.setRiderEmail(riderEmail);
            orderRepository.save(order);
            RiderEmailResponse response = RiderEmailResponse.newBuilder()
                    .setMessage("Rider email updated successfully")
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(Status.INTERNAL.withDescription("Internal server error").asRuntimeException());
        }
    }

}
