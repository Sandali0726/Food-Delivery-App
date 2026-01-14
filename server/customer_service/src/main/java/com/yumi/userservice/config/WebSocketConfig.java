package com.yumi.userservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Use simple broker for now; frontend will subscribe to /topic/**
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix for messages bound for @MessageMapping (app) - not used here but conventional
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint clients will connect to
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }
}

