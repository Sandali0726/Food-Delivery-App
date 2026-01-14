//package com.example.riderservice.config;
//
//import com.fasterxml.jackson.databind.DeserializationFeature;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.databind.SerializationFeature;
//import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
//import org.apache.kafka.common.serialization.Deserializer;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
//import java.util.Map;
//
///**
// * Custom deserializer that gracefully handles deserialization errors
// * and converts JSON strings to Maps
// */
//public class SafeMapDeserializer implements Deserializer<Map<String, Object>> {
//
//    private static final Logger log = LoggerFactory.getLogger(SafeMapDeserializer.class);
//    private final ObjectMapper objectMapper;
//
//    public SafeMapDeserializer() {
//        this.objectMapper = new ObjectMapper();
//        // Configure ObjectMapper with JSR310 support
//        objectMapper.registerModule(new JavaTimeModule());
//        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
//        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
//    }
//
//    @Override
//    public void configure(Map<String, ?> configs, boolean isKey) {
//        // Configuration if needed
//    }
//
//    @Override
//    public Map<String, Object> deserialize(String topic, byte[] data) {
//        if (data == null) {
//            log.warn("Received null data for topic: {}", topic);
//            return null;
//        }
//
//        try {
//            String jsonString = new String(data);
//            log.debug("Deserializing JSON: {}", jsonString);
//
//            @SuppressWarnings("unchecked")
//            Map<String, Object> result = objectMapper.readValue(jsonString, Map.class);
//            return result;
//        } catch (Exception e) {
//            log.error("Failed to deserialize message from topic: {} - Error: {}", topic, e.getMessage());
//            log.debug("Raw data: {}", new String(data));
//
//            // Return null to signal deserialization failure
//            // The ErrorHandlingDeserializer will handle this appropriately
//            return null;
//        }
//    }
//
//    @Override
//    public void close() {
//        // Cleanup if needed
//    }
//}
