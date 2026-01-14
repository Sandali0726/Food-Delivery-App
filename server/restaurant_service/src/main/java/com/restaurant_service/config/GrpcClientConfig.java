package com.restaurant_service.config;

import com.example.grpc.customer.CustomerServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcClientConfig {

    // Expose an explicit blocking stub bean so the IDE and Spring can autowire by type.
    @Bean
    public CustomerServiceGrpc.CustomerServiceBlockingStub customerServiceBlockingStub(@GrpcClient("customer-service") io.grpc.Channel channel) {
        return CustomerServiceGrpc.newBlockingStub(channel);
    }
}

