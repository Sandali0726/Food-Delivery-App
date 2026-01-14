# RiderService Docker Setup

This directory contains Docker configuration for the RiderService Spring Boot application.

## Files Created

- **Dockerfile**: Multi-stage Docker build configuration
- **docker-compose.yml**: Development environment with local PostgreSQL and Kafka
- **docker-compose.prod.yml**: Production environment using external services
- **.dockerignore**: Optimizes Docker build context
- **docker-scripts.sh**: Management script for common Docker operations

## Quick Start

### Option 1: Using the Management Script

Make the script executable:
```bash
chmod +x docker-scripts.sh
```

Available commands:
```bash
# Build the Docker image
./docker-scripts.sh build

# Run development environment (with local DB and Kafka)
./docker-scripts.sh dev

# Run production environment (with external services)
./docker-scripts.sh prod

# Stop all containers
./docker-scripts.sh stop

# Clean up everything
./docker-scripts.sh clean

# Show logs
./docker-scripts.sh logs

# Access container shell
./docker-scripts.sh shell

# Show help
./docker-scripts.sh help
```

### Option 2: Using Docker Compose Directly

#### Development Environment
```bash
# Build and run with local dependencies
docker-compose up -d

# Check logs
docker-compose logs -f rider-service

# Stop
docker-compose down
```

#### Production Environment
```bash
# Build and run with external services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f rider-service

# Stop
docker-compose -f docker-compose.prod.yml down
```

## Service Access

When running, the service will be available at:
- **HTTP API**: http://localhost:8080
- **gRPC Server**: localhost:9091
- **Health Check**: http://localhost:8080/actuator/health

## Development vs Production

### Development Environment (`docker-compose.yml`)
- Includes local PostgreSQL database
- Includes local Kafka and Zookeeper
- Uses debug logging
- Suitable for local development

### Production Environment (`docker-compose.prod.yml`)
- Uses your existing Neon database
- Expects external Kafka service
- Optimized logging
- Production-ready configuration

## Environment Configuration

The production setup uses the same configuration as your `application.properties` file:

### Database
- **Host**: ep-raspy-dust-a4ocg293-pooler.us-east-1.aws.neon.tech
- **Database**: neondb
- **User**: neondb_owner

### Email Service
- **Host**: smtp.gmail.com
- **Port**: 587
- **Username**: gayashankavishka2@gmail.com

### Cloudinary
- **Cloud Name**: dvsmpntdf
- **API Key**: 637365868341956

### gRPC
- **Server Port**: 9091
- **Security**: Disabled

## Customization

To modify the configuration:

1. **Environment Variables**: Edit the `environment` section in the docker-compose files
2. **Ports**: Change port mappings in the `ports` section
3. **Dependencies**: Modify the `depends_on` section
4. **Health Checks**: Adjust health check commands and intervals

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 8080, 9091, 5432, and 9092 are not in use
2. **Database Connection**: Verify your Neon database credentials and network access
3. **Memory Issues**: Adjust JVM options in the Dockerfile if needed

### Debugging

```bash
# Check container status
docker ps

# View logs
docker logs rider-service

# Access container shell
docker exec -it rider-service sh

# Check network connectivity
docker network ls
docker network inspect rider-service_yumy-network
```

## Building for Different Architectures

To build for specific platforms:
```bash
# For ARM64 (Apple Silicon)
docker build --platform linux/arm64 -t rider-service:arm64 .

# For AMD64 (Intel/AMD)
docker build --platform linux/amd64 -t rider-service:amd64 .

# Multi-platform build
docker buildx build --platform linux/amd64,linux/arm64 -t rider-service:latest .
```

## Production Deployment Considerations

1. **Secrets Management**: Replace hardcoded credentials with secrets management
2. **Monitoring**: Add application monitoring and logging solutions
3. **Load Balancing**: Consider using a reverse proxy like Nginx
4. **SSL/TLS**: Configure HTTPS for production
5. **Resource Limits**: Set appropriate memory and CPU limits
6. **Backup Strategy**: Ensure database backup procedures are in place
