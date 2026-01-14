package com.restaurant_service.service;

import com.restaurant_service.dto.DeliveryRequestLogCreateDto;
import com.restaurant_service.dto.DeliveryRequestLogResponseDto;
import com.restaurant_service.model.RestaurantOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;
import com.restaurant_service.enums.DeliveryRequestStatus;

public interface DeliveryRequestLogService {
    DeliveryRequestLogResponseDto create(DeliveryRequestLogCreateDto dto);
    DeliveryRequestLogResponseDto getById(UUID id);
    List<DeliveryRequestLogResponseDto> listByOrderId(Long orderId);
    List<DeliveryRequestLogResponseDto> listByRestaurantEmail();

    // paginated version for controller
    Page<DeliveryRequestLogResponseDto> listByRestaurantEmail(Pageable pageable);

    void delete(UUID id);

    // Create a DeliveryRequestLog from a RestaurantOrder when its status becomes READY
    // and trigger publishing of the ORDER_READY Kafka event.
    void createForOrderReady(RestaurantOrder order);

    // Update the status of delivery request logs associated with a given orderId.
    void updateStatusByOrderId(Long orderId, DeliveryRequestStatus status);

}
