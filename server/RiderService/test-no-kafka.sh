#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Testing RiderService without Kafka${NC}"
echo ""

# Navigate to the RiderService directory
cd /home/gayashan-de-silva/Documents/yumy/server/RiderService

# Test local run with Docker profile
echo -e "${YELLOW}Testing local run with Docker profile...${NC}"
SPRING_PROFILES_ACTIVE=docker ./gradlew bootRun &
BOOT_PID=$!

# Wait a bit for startup
sleep 15

# Test health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:8080/actuator/health)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Health endpoint accessible!${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Health endpoint not accessible${NC}"
fi

# Stop the application
kill $BOOT_PID 2>/dev/null
wait $BOOT_PID 2>/dev/null

echo ""
echo -e "${GREEN}Local test completed. If successful, Docker should also work.${NC}"
