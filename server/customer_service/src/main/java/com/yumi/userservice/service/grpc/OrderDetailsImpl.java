package com.yumi.userservice.service.grpc;

import com.example.grpc.OrderDetailsRequest;
import com.example.grpc.OrderDetailsResponse;
import com.example.grpc.OrderServiceGrpc;
import com.yumi.userservice.model.Order;
import com.yumi.userservice.repository.OrderRepository;
import io.grpc.stub.StreamObserver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.grpc.server.service.GrpcService;
import java.util.List;
import java.util.stream.Collectors;

@GrpcService
    public class OrderDetailsImpl extends OrderServiceGrpc.OrderServiceImplBase {

        @Autowired
        private OrderRepository orderRepository;
    @Override
        public void getOrderDetails(
                OrderDetailsRequest request,
                StreamObserver<OrderDetailsResponse> responseObserver) {

            // order id is a numeric Long in the DB, parse accordingly
            Long orderId = Long.parseLong(request.getOrderId());

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            List<OrderDetailsResponse.OrderItem> grpcItems = order.getOrderItems()
                    .stream()
                    .map(item ->
                            OrderDetailsResponse.OrderItem.newBuilder()
                                    .setOrderName(item.getItemName())
                                    .setOrderQuantity(item.getQuantity())
                                    .build()
                    )
                    .collect(Collectors.toList());

            OrderDetailsResponse response = OrderDetailsResponse.newBuilder()
                    .addAllItems(grpcItems)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        }


}
