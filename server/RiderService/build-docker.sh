#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔨 Building RiderService Docker Image${NC}"
echo ""

# Navigate to the docker-compose directory
cd /home/gayashan-de-silva/Documents/yumy/DockerComposeRider

echo -e "${YELLOW}Building rider-service container...${NC}"

# Build the service
docker-compose build rider-service

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}To run the service:${NC}"
    echo "docker-compose up -d rider-service"
    echo ""
    echo -e "${YELLOW}To view logs:${NC}"
    echo "docker-compose logs -f rider-service"
    echo ""
else
    echo -e "${RED}❌ Build failed!${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting tips:${NC}"
    echo "1. Check if all files are in the correct locations"
    echo "2. Verify the protobuf files exist in src/main/proto/"
    echo "3. Try running: docker system prune -f"
    echo ""
    exit 1
fi
