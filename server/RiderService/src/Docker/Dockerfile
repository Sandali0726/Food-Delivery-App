# Multi-stage Docker build for RiderService
FROM eclipse-temurin:17-jdk AS builder

# Install dependencies including wget for downloading protoc-gen-grpc-java
RUN apt-get update && apt-get install -y \
    protobuf-compiler \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Download and install the correct protoc-gen-grpc-java executable
RUN mkdir -p /usr/local/bin && \
    wget https://repo1.maven.org/maven2/io/grpc/protoc-gen-grpc-java/1.77.0/protoc-gen-grpc-java-1.77.0-linux-x86_64.exe \
    -O /usr/local/bin/protoc-gen-grpc-java && \
    chmod +x /usr/local/bin/protoc-gen-grpc-java

# Add to PATH
ENV PATH="/usr/local/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy Gradle wrapper and build files
COPY ../../gradlew .
COPY ../../gradlew.bat .
COPY ../../gradle gradle/
COPY ../../build.gradle .
COPY ../../settings.gradle .

# Make gradlew executable
RUN chmod +x gradlew

# Copy source code
COPY ../../src src/

# Build the application using bootJar task
RUN ./gradlew clean bootJar -x test --no-daemon --info

# Runtime stage
FROM eclipse-temurin:17-jre

# Install curl for health checks
#RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
# Install tzdata + curl
RUN apt-get update && apt-get install -y \
    tzdata \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set timezone explicitly
ENV TZ=Asia/Colombo

# Create app user
RUN groupadd -r app && useradd -r -g app app

# Set working directory
WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Change ownership to app user
RUN chown -R app:app /app

# Switch to app user
USER app

# Expose ports
EXPOSE 8080 9091

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Set JVM options
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseContainerSupport -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
