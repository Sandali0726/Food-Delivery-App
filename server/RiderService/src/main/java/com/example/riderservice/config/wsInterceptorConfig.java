package com.example.riderservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
public class wsInterceptorConfig implements WebSocketMessageBrokerConfigurer {

    private final webSocketAuthInterceptor interceptor;

    public wsInterceptorConfig(webSocketAuthInterceptor interceptor) {
        this.interceptor = interceptor;
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(interceptor);
    }
}

