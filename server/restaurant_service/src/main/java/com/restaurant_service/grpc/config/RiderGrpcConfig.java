package com.restaurant_service.grpc.config;

import com.restaurant_service.grpc.RiderDetailsServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class RiderGrpcConfig {

    @Value("${rider.grpc.host:localhost}")
    private String host;

    @Value("${rider.grpc.port:50051}")
    private int port;

    private ManagedChannel channel;

    @Bean
    public ManagedChannel riderManagedChannel() {
        this.channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext() // for development. Replace with TLS in production.
                .build();
        return this.channel;
    }

    @Bean
    public RiderDetailsServiceGrpc.RiderDetailsServiceBlockingStub riderBlockingStub(ManagedChannel channel) {
        return RiderDetailsServiceGrpc.newBlockingStub(channel);
    }

    @PreDestroy
    public void shutdown() throws InterruptedException {
        if (this.channel != null) {
            this.channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
        }
    }
}

