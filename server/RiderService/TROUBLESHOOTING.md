# Docker Build Troubleshooting Guide for RiderService

## Issue Fixed: protoc-gen-grpc-java executable not found

### Problem
The original error was:
```
protoc: stdout: . stderr: protoc-gen-grpc-java-1.77.0-linux-x86_64.exe: program not found or is not executable
```

### Solution
The Dockerfile has been updated to:

1. **Use Debian-based image** instead of Alpine Linux for better compatibility
2. **Manually download and install** the correct `protoc-gen-grpc-java` executable
3. **Add proper PATH configuration** for the protobuf compiler
4. **Install all required dependencies** for protobuf compilation

## Updated Files

- ✅ `src/Docker/Dockerfile` - Fixed protobuf compilation issues
- ✅ `.dockerignore` - Optimized build context
- ✅ `build-docker.sh` - Helper script for building

## Build Instructions

### Method 1: Using Docker Compose (Recommended)
```bash
cd /home/gayashan-de-silva/Documents/yumy/DockerComposeRider
docker-compose build rider-service
```

### Method 2: Using Docker directly
```bash
cd /home/gayashan-de-silva/Documents/yumy/server/RiderService
docker build -f src/Docker/Dockerfile -t rider-service:latest .
```

### Method 3: Using the build script
```bash
chmod +x build-docker.sh
./build-docker.sh
```

## Key Changes Made

1. **Base Image**: Changed from `eclipse-temurin:17-jdk-alpine` to `eclipse-temurin:17-jdk` (Debian-based)
2. **Dependencies**: Added `wget` and `unzip` for downloading the gRPC plugin
3. **Manual Installation**: Download the correct `protoc-gen-grpc-java` executable directly
4. **PATH Configuration**: Ensure the protobuf plugin is available in the system PATH
5. **Gradle Options**: Added `--no-daemon` to prevent daemon issues in containers

## Verification

After building, verify the image:
```bash
# List Docker images
docker images | grep rider-service

# Run a test container
docker run --rm -p 8080:8080 -p 9091:9091 rider-service:latest

# Check health (in another terminal)
curl http://localhost:8080/actuator/health
```

## Common Issues and Solutions

### Issue 1: Build context too large
**Solution**: The `.dockerignore` file excludes unnecessary files. Ensure it's present.

### Issue 2: Gradle daemon issues
**Solution**: The build now uses `--no-daemon` flag.

### Issue 3: Permission denied on gradlew
**Solution**: The Dockerfile includes `chmod +x gradlew`.

### Issue 4: Out of memory during build
**Solution**: Add more memory to Docker Desktop or use build args:
```bash
docker build --memory=4g -f src/Docker/Dockerfile -t rider-service:latest .
```

## Build Optimization

The Dockerfile is optimized for:
- ✅ Multi-stage builds (smaller final image)
- ✅ Layer caching (dependencies cached separately)
- ✅ Security (non-root user)
- ✅ Health checks
- ✅ Proper JVM settings for containers

## Next Steps

1. **Test the build**: Run the build script or docker-compose command
2. **Run the service**: Use docker-compose up to start both services
3. **Verify connectivity**: Check if gRPC and HTTP endpoints are accessible
4. **Monitor logs**: Use `docker-compose logs -f rider-service` to monitor

## Environment Configuration

The service expects these environment variables (configured in docker-compose.yml):
- `SPRING_PROFILES_ACTIVE=docker`
- Database configuration
- Kafka configuration  
- gRPC settings

## Support

If you encounter issues:
1. Check the build logs for specific error messages
2. Verify all proto files exist in `src/main/proto/`
3. Ensure Docker has sufficient resources allocated
4. Try cleaning the Docker cache: `docker system prune -f`
