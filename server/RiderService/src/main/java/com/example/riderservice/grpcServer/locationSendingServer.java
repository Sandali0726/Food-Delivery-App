package com.example.riderservice.grpcServer;

import com.example.grpc.LocationRequest;
import com.example.grpc.RiderLocationQueryServiceGrpc;
import com.example.grpc.RiderLocationResponse;
import com.example.riderservice.model.delivery_task;
import com.example.riderservice.model.rider;
import com.example.riderservice.repository.delivery_taskRepository;
import com.example.riderservice.repository.riderRepository;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.web.bind.annotation.RequestBody;

@GrpcService
@RequiredArgsConstructor
public class locationSendingServer extends RiderLocationQueryServiceGrpc.RiderLocationQueryServiceImplBase {

    final riderRepository riderRepository;
    final delivery_taskRepository delivery_taskRepository;

    @Override
    public void getCurrentLocation(LocationRequest request, StreamObserver<RiderLocationResponse> responseObserver){

        Long orderId = request.getOrderId();

        delivery_task task = delivery_taskRepository.findByOrderId(orderId);
        if (task == null) {
            responseObserver.onError(
                    io.grpc.Status.NOT_FOUND
                            .withDescription("Delivery task not found for order ID: " + orderId)
                            .asRuntimeException()
            );
            return;
        }
        rider rider = riderRepository.findByEmail(task.getRider().getEmail());

        RiderLocationResponse response = RiderLocationResponse.newBuilder()
                .setOrderId(task.getOrderId())
                .setLat(rider.getCurrent_lat())
                .setLng(rider.getCurrent_lng())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
