package com.restaurant_service.grpc;

import com.restaurant_service.enums.DeliveryRequestStatus;
import com.restaurant_service.model.DeliveryRequestLog;
import com.restaurant_service.repository.DeliveryRequestLogRepository;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.List;

@GrpcService
public class DeliveryGrpcService extends DeliveryServiceGrpc.DeliveryServiceImplBase {

    private final DeliveryRequestLogRepository deliveryRequestLogRepository;

    public DeliveryGrpcService(DeliveryRequestLogRepository deliveryRequestLogRepository) {
        this.deliveryRequestLogRepository = deliveryRequestLogRepository;
    }

    @Override
    public void acceptDeliveryRequest(AcceptDeliveryRequestRequest request,
                                      StreamObserver<DeliveryAcceptResponse> responseObserver) {
        long orderId = request.getOrderId();

        if (orderId <= 0) {
            responseObserver.onError(
                    Status.INVALID_ARGUMENT
                            .withDescription("Invalid order_id: " + orderId)
                            .asRuntimeException()
            );
            return;
        }

        List<DeliveryRequestLog> logs = deliveryRequestLogRepository.findByOrderId(orderId);

        if (logs.isEmpty()) {
            responseObserver.onError(
                    Status.NOT_FOUND
                            .withDescription("Delivery request not found for orderId=" + orderId)
                            .asRuntimeException()
            );
            return;
        }

        // For now, assume one active delivery request per order; update the first one.
        DeliveryRequestLog log = logs.get(0);
        log.setDeliveryId(request.getDeliveryId());
        log.setStatus(DeliveryRequestStatus.ASSIGNED);

        DeliveryRequestLog saved = deliveryRequestLogRepository.save(log);

        DeliveryAcceptResponse response = DeliveryAcceptResponse.newBuilder()
                .setSuccess(true)
                .setMessage("Delivery request accepted for orderId=" + saved.getOrderId())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
