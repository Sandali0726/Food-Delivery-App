package com.example.riderservice.config;

import com.example.grpc.*;
import com.example.grpc.customer.CustomerServiceGrpc;
import com.restaurant_service.grpc.DeliveryServiceGrpc;
import com.restaurant_service.grpc.RestaurantServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcClientConfig {

    @Bean
    public ManagedChannel customerChannel() {
        return ManagedChannelBuilder
                .forAddress("10.20.11.237", 9090)
                .usePlaintext()
                .build();
    }

    @Bean
    public ManagedChannel restaurantChannel() {
        return ManagedChannelBuilder
                .forAddress("10.20.11.46", 9091)
                .usePlaintext()
                .build();
    }



    @Bean
    public RiderReviewServiceGrpc.RiderReviewServiceBlockingStub riderReviewStub(ManagedChannel customerChannel) {
        return RiderReviewServiceGrpc.newBlockingStub(customerChannel);
    }

    @Bean
    public OrderServiceGrpc.OrderServiceBlockingStub orderServiceStub(ManagedChannel customerChannel) {
        return OrderServiceGrpc.newBlockingStub(customerChannel);
    }

    @Bean
    public TableStatusServiceGrpc.TableStatusServiceBlockingStub tableStatusServiceStub(ManagedChannel customerChannel) {
        return TableStatusServiceGrpc.newBlockingStub(customerChannel);
    }
    @Bean
    public RestaurantServiceGrpc.RestaurantServiceBlockingStub restaurantServiceStub(ManagedChannel restaurantChannel) {
        return RestaurantServiceGrpc.newBlockingStub(restaurantChannel);
    }

    @Bean
    public CustomerServiceGrpc.CustomerServiceBlockingStub customerServiceStub(ManagedChannel customerChannel) {
        return CustomerServiceGrpc.newBlockingStub(customerChannel);
    }

    @Bean
    public DeliveryServiceGrpc.DeliveryServiceBlockingStub deliveryServiceStub(ManagedChannel restaurantChannel) {
        return DeliveryServiceGrpc.newBlockingStub(restaurantChannel);
    }

    @Bean
    public ReviewRateServiceGrpc.ReviewRateServiceBlockingStub reviewRateServiceStub(ManagedChannel customerChannel) {
        return ReviewRateServiceGrpc.newBlockingStub(customerChannel);
    }

    @Bean
    public RiderEmailServiceGrpc.RiderEmailServiceBlockingStub riderEmailServiceStub(ManagedChannel customerChannel) {
        return RiderEmailServiceGrpc.newBlockingStub(customerChannel);
    }



}
