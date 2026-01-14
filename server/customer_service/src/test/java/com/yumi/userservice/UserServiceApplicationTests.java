package com.yumi.userservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
        // Avoid gRPC port binding during tests. If spring-grpc uses 'grpc.server.port', set to 0 (random free port).
        "grpc.server.port=0",
        // Optionally, if your app sets server.port for HTTP, keep default random or ensure no conflict.
        "server.port=0",
        // Use an in-memory or lightweight DB in tests if desired (left as-is here).
})
@ActiveProfiles("test")
class UserServiceApplicationTests {

    @Test
    void contextLoads() {
    }

}
