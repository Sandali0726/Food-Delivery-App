# Multi-stage Dockerfile for Spring Boot (Gradle)
# Build stage
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /workspace

# Install bash and core utilities if needed
RUN apt-get update && apt-get install -y --no-install-recommends bash ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy Gradle wrapper and build files first for better layer caching
COPY gradlew gradlew
COPY gradle/ gradle/
COPY build.gradle build.gradle
COPY settings.gradle settings.gradle
COPY src/ src/

# Ensure gradlew is executable
RUN chmod +x gradlew

# Build the executable jar
RUN ./gradlew clean bootJar --no-daemon

# Runtime stage
FROM eclipse-temurin:17-jre

# Add a non-root user for security
RUN useradd -m -u 10001 app
WORKDIR /app

# Copy the built jar (use wildcard to handle versioned names) and rename to app.jar
COPY --from=builder /workspace/build/libs/*SNAPSHOT.jar /app/app.jar

# Environment variables (can be overridden at runtime)
ENV SERVER_PORT=8085

# Expose the application port
EXPOSE 8085 9090

# Optional healthcheck (requires actuator)
# HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
#   CMD wget -qO- http://127.0.0.1:8085/actuator/health || exit 1

# Use non-root user
USER 10001

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
