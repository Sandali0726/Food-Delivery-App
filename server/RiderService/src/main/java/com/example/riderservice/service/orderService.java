package com.example.riderservice.service;

import com.example.riderservice.enums.Delivery_status;
import com.example.riderservice.grpcClientService.RiderEmailToCustomerClent;
import com.example.riderservice.grpcClientService.customerOrderStatusClient;
import com.example.riderservice.grpcClientService.riderAcceptAckClient;
import com.example.riderservice.model.delivery_task;
import com.example.riderservice.model.order;
import com.example.riderservice.model.rejectOrders;
import com.example.riderservice.model.rider;
import com.example.riderservice.repository.delivery_taskRepository;
import com.example.riderservice.repository.orderRepository;
import com.example.riderservice.repository.rejectOrdersRepository;
import com.example.riderservice.repository.riderRepository;
import com.example.riderservice.webSocket.webSocketPublisher;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class orderService {

   private static final Logger log = LoggerFactory.getLogger(orderService.class);

   private final orderRepository orderRepository;
   private final webSocketPublisher socketPublisher;
   private final riderRepository riderRepository;
   private final delivery_taskRepository deliveryTaskRepository;
   private final customerOrderStatusClient customerOrderStatusClient;
   private final riderAcceptAckClient riderAcceptAckClient;
   private final rejectOrdersRepository rejectOrdersRepository;
   private final RiderEmailToCustomerClent riderEmailToCustomerClent;

   public List<order> getAllOrders(String email){

       rider rider = riderRepository.findByEmail(email);
       if(rider == null){
           throw new RuntimeException("Rider not found");
       }

       return   orderRepository.findOrdersWithinRadiusNotRejected(
                rider.getCurrent_lat(),
                rider.getCurrent_lng(),
                10.0, // radius in kilometers
                email
       );
   }

   public order createOrder(order order){
       // defensive checks and idempotency: if an order with same id already exists, return it instead of creating duplicate
       if (order == null) {
           throw new IllegalArgumentException("Order cannot be null");
       }
       if (order.getOrderId() == null) {
           throw new IllegalArgumentException("Order must have an orderId");
       }

       if (orderRepository.existsById(order.getOrderId())) {
           log.info("Order with id {} already exists - skipping create", order.getOrderId());
           return orderRepository.findById(order.getOrderId()).orElse(order);
       }

       order result = orderRepository.save(order);
       try {
           socketPublisher.sendNewOrder(order);
       } catch (Exception e) {
           // Log but don't fail the creation if websocket push fails
           log.warn("Failed to send new order over websocket for order {}: {}", order.getOrderId(), e.getMessage());
       }
       return result;
   }


   public delivery_task acceptOrder(Long orderId, String riderEmail , float totalDistance, float totalTime) {
       System.out.println("Claculate fee for distance :"+totalDistance+"and Time: "+totalTime);
       order order = orderRepository.findById(orderId)
               .orElseThrow(() -> new RuntimeException("Order not found"));

       float deliveryFee = calculateDeliveryFee(totalDistance, totalTime);

       rider rider = riderRepository.findByEmail(riderEmail);

       delivery_task exsisting = deliveryTaskRepository.findByOrderId(orderId);

       if(exsisting != null){
           throw new RuntimeException("Order already accepted by another rider");
       }

       delivery_task task = delivery_task.builder()
                            .orderId(orderId)
                            .rider(rider)
                            .deliveryPrice(deliveryFee)
                            .order_price(order.getOrderPrice())
                            .customerEmail(order.getCustomerEmail())
                            .status(Delivery_status.ACCEPTED)
                            .drop_lat(order.getDropLat())
                            .drop_lng(order.getDropLng())
                            .pickup_lat(order.getPickupLat())
                            .pickup_lng(order.getPickupLng())
                            .restaurantId(order.getRestaurantEmail())
                            .otp_number((long) order.getOtp())
                            .acceptedAt(LocalDateTime.now())
                            .build();

       orderRepository.delete(order);
       socketPublisher.removeOrder(orderId);
       try{
              riderAcceptAckClient.sendRiderAcceptAck(orderId, riderEmail);
       }catch(Exception e){
              System.out.println("Failed send RiderAccept ack for restaurant  through gRPC: " + e.getMessage());
       }
       try{
           String response = customerOrderStatusClient.updateCustomerOrderStatus(orderId ,"RIDER_ASSIGNED");
           System.out.println("Customer order status updated: " + response);
       }catch(Exception e){
           System.out.println("Failed to update customer order status through : " + e.getMessage());
       }
       try{
           String response = riderEmailToCustomerClent.sendRiderEmailToCustomer(orderId, riderEmail);
           System.out.println(response);
       }catch(Exception e){
           System.out.println("Failed to send rider email to customer through gRPC: " + e.getMessage());
       }
       return deliveryTaskRepository.save(task);

   }

   public float calculateDeliveryFee(float distanceInKm, float timeInMinutes) {
       float baseFee = 5.0f; // Base fee in currency units
       float perKmRate = 2.0f; // Rate per kilometer
       float perMinuteRate = 0.5f; // Rate per minute
       float minimumFee = 10.0f; // Minimum delivery fee

       float fee = baseFee + (perKmRate * distanceInKm) + (perMinuteRate * timeInMinutes);

       return Math.max(fee, minimumFee);

   }


    public double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the Earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public String  addRejectedOrders(Long orderId,String riderEmail){

        rejectOrdersRepository.save( rejectOrders.builder()
                            .orderId(orderId)
                            .email(riderEmail)
                             .build());
        return "Rejected order added successfully";
    }

    public void clearRejectedOrders(Long orderId){
        List<rejectOrders> rejectedOrders = rejectOrdersRepository.findByOrderId(orderId);
        rejectOrdersRepository.deleteAll(rejectedOrders);
    }



}
