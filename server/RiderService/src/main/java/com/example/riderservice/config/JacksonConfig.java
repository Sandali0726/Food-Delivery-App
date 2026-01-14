//package com.example.riderservice.config;
//
//import com.fasterxml.jackson.databind.DeserializationFeature;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.databind.SerializationFeature;
//import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.context.annotation.Primary;
//
//@Configuration
//public class JacksonConfig {
//
//    @Bean
//    @Primary
//    public ObjectMapper objectMapper() {
//        ObjectMapper mapper = new ObjectMapper();
//
//        // Register JavaTimeModule for handling Java 8 time types
//        mapper.registerModule(new JavaTimeModule());
//
//        // Configure to ignore unknown properties globally
//        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
//
//        // Configure to handle missing properties gracefully
//        mapper.configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, false);
//
//        // Configure to handle empty strings as null
//        mapper.configure(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);
//
//        // Disable writing dates as timestamps (write as ISO-8601 strings instead)
//        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
//
//        return mapper;
//    }
//}
