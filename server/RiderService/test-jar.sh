#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 Testing RiderService JAR Build${NC}"
echo ""

# Navigate to the RiderService directory
cd /home/gayashan-de-silva/Documents/yumy/server/RiderService

# Clean and build
echo -e "${YELLOW}Building JAR locally...${NC}"
./gradlew clean bootJar -x test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ JAR build successful!${NC}"

    # Check if JAR exists and list it
    echo -e "${YELLOW}Checking built JAR...${NC}"
    ls -la build/libs/

    # Test the JAR structure
    echo -e "${YELLOW}Checking JAR contents...${NC}"
    jar -tf build/libs/*.jar | grep "com/example/riderservice/RiderServiceApplication.class"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Main class found in JAR!${NC}"
    else
        echo -e "${RED}❌ Main class NOT found in JAR!${NC}"
        echo "JAR contents:"
        jar -tf build/libs/*.jar | head -20
    fi

    # Test manifest
    echo -e "${YELLOW}Checking MANIFEST.MF...${NC}"
    jar -xf build/libs/*.jar META-INF/MANIFEST.MF
    cat META-INF/MANIFEST.MF | grep -E "(Main-Class|Start-Class)"

else
    echo -e "${RED}❌ JAR build failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Local test completed. If successful, try rebuilding Docker image.${NC}"
