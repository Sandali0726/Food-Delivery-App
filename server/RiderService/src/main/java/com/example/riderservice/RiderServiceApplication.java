package com.example.riderservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(
        exclude = {
                net.devh.boot.grpc.server.autoconfigure.GrpcServerSecurityAutoConfiguration.class
        }
)
public class RiderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RiderServiceApplication.class, args);
    }

}
