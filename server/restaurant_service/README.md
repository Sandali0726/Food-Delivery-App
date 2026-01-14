# Restaurant Service
Spring Boot-based restaurant management service with Kafka consumers, gRPC endpoints, and integration to PostgreSQL, Cloudinary, and Gmail SMTP.
## Build Locally
```bash
./gradlew clean bootJar
```
## Run Tests
```bash
./gradlew test
```
## Docker
```bash
docker build -t restaurant-service:latest .
docker run --rm -p 8081:8081 restaurant-service:latest
```
