package com.yumi.userservice.config;

import com.example.grpc.RiderDetailsServiceGrpc;
import com.example.grpc.RiderRatingServiceGrpc;
import com.example.grpc.RiderLocationQueryServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcClientConfig {

    @Bean
    public ManagedChannel restaurantChannel() {
        return ManagedChannelBuilder
                .forAddress("10.20.11.46", 9091)//10.20.11.46
                .usePlaintext()
                .build();
    }

    @Bean
    public  ManagedChannel riderChannel() {
        return ManagedChannelBuilder
                .forAddress("10.20.11.67", 9091) //10.20.11.67
                .usePlaintext()
                .build();
    }

    @Bean
    public RiderDetailsServiceGrpc.RiderDetailsServiceBlockingStub riderStub(ManagedChannel riderChannel) {
        return RiderDetailsServiceGrpc.newBlockingStub(riderChannel);
    }
    @Bean
    public RiderRatingServiceGrpc.RiderRatingServiceBlockingStub riderReviewStub(ManagedChannel riderChannel) {
        return RiderRatingServiceGrpc.newBlockingStub(riderChannel);
    }

    @Bean
    public RiderLocationQueryServiceGrpc.RiderLocationQueryServiceBlockingStub riderLocationStub(ManagedChannel riderChannel) {
        return RiderLocationQueryServiceGrpc.newBlockingStub(riderChannel);
    }

}
