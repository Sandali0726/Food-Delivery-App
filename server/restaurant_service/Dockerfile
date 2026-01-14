# Builder stage: build the Spring Boot fat jar with Gradle
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app

# Install bash and other utilities if needed (optional, but handy for debugging)
RUN apt-get update \
    && apt-get install -y --no-install-recommends bash \
    && rm -rf /var/lib/apt/lists/*

# Copy Gradle wrapper and build configuration
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle

# Pre-fetch dependencies (optional but speeds up subsequent builds)
RUN ./gradlew --no-daemon dependencies || return 0

# Copy source
COPY src ./src

# Build the boot jar
RUN ./gradlew --no-daemon clean bootJar

# Runtime stage: minimal image just to run the jar
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Environment variables for Spring Boot
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS=""

# Copy the built jar from the builder stage
COPY --from=builder /app/build/libs/app.jar ./app.jar

# Expose HTTP and gRPC ports (match application.properties)
EXPOSE 8081 9091

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
