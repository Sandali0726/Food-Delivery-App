package com.yumi.userservice.service.grpc;
import com.example.grpc.TableStatusRequest;
import com.example.grpc.TableStatusResponse;
import com.example.grpc.TableStatusServiceGrpc;
import com.yumi.userservice.model.Order;
import com.yumi.userservice.repository.OrderRepository;
import com.yumi.userservice.service.OrderService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.grpc.server.service.GrpcService;

@GrpcService
public class TableStatusServiceImpl extends TableStatusServiceGrpc.TableStatusServiceImplBase {
    @Autowired
    private  OrderRepository orderRepository;
    @Autowired
    private OrderService orderService;

    @Override
    public void changeTableStatus(TableStatusRequest request, StreamObserver<TableStatusResponse> responseObserver) {
        try {
            long tableId = request.getTableId();
            String status = request.getStatus();

            // Validate inputs based on proto contract
            if (tableId == 0) {
                responseObserver.onError(Status.INVALID_ARGUMENT.withDescription("table_id is required").asRuntimeException());
                return;
            }
            if (status.isBlank()) { // proto3 strings are never null; default is ""
                responseObserver.onError(Status.INVALID_ARGUMENT.withDescription("status is required").asRuntimeException());
                return;
            }

            // Map incoming status string to Order.Status enum
            final Order.Status newStatus;
            try {
                newStatus = Order.Status.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                responseObserver.onError(Status.INVALID_ARGUMENT.withDescription("Invalid status: " + status).asRuntimeException());
                return;
            }

            // Note: table_id from proto is treated as orderId in our domain
            Order order = orderRepository.findById(tableId)
                    .orElse(null);
            if (order == null) {
                responseObserver.onError(Status.NOT_FOUND.withDescription("Order not found for id: " + tableId).asRuntimeException());
                return;
            }

            // Delegate status update to OrderService so websocket and kafka events are handled in one place
            orderService.updateStatus(tableId, newStatus);

            TableStatusResponse response = TableStatusResponse.newBuilder()
                    .setMessage("Order " + order.getOrderId() + " status updated to '" + newStatus + "'")
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(Status.INTERNAL.withDescription("Failed to change table status").withCause(e).asRuntimeException());
        }
    }
}
