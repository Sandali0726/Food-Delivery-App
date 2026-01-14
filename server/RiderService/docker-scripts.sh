#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 RiderService Docker Management Script${NC}"
echo ""

# Function to display help
show_help() {
    echo "Usage: ./docker-scripts.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build           Build the Docker image"
    echo "  dev             Run development environment (with local DB and Kafka)"
    echo "  prod            Run production environment (with external services)"
    echo "  stop            Stop all containers"
    echo "  clean           Stop and remove containers, networks, and images"
    echo "  logs            Show logs for the rider-service container"
    echo "  shell           Access the container shell"
    echo "  help            Show this help message"
    echo ""
}

# Function to build the Docker image
build_image() {
    echo -e "${YELLOW}Building RiderService Docker image...${NC}"
    docker build -t rider-service:latest .
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker image built successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to build Docker image${NC}"
        exit 1
    fi
}

# Function to run development environment
run_dev() {
    echo -e "${YELLOW}Starting development environment...${NC}"
    docker-compose up -d
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Development environment started!${NC}"
        echo -e "${GREEN}🌐 RiderService is running at: http://localhost:8080${NC}"
        echo -e "${GREEN}🔗 gRPC server is running at: localhost:9091${NC}"
        echo -e "${GREEN}🐘 PostgreSQL is running at: localhost:5432${NC}"
        echo -e "${GREEN}📨 Kafka is running at: localhost:9092${NC}"
    else
        echo -e "${RED}❌ Failed to start development environment${NC}"
        exit 1
    fi
}

# Function to run production environment
run_prod() {
    echo -e "${YELLOW}Starting production environment...${NC}"
    docker-compose -f docker-compose.prod.yml up -d
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Production environment started!${NC}"
        echo -e "${GREEN}🌐 RiderService is running at: http://localhost:8080${NC}"
        echo -e "${GREEN}🔗 gRPC server is running at: localhost:9091${NC}"
    else
        echo -e "${RED}❌ Failed to start production environment${NC}"
        exit 1
    fi
}

# Function to stop containers
stop_containers() {
    echo -e "${YELLOW}Stopping containers...${NC}"
    docker-compose down
    docker-compose -f docker-compose.prod.yml down
    echo -e "${GREEN}✅ Containers stopped!${NC}"
}

# Function to clean up everything
clean_up() {
    echo -e "${YELLOW}Cleaning up containers, networks, and images...${NC}"
    docker-compose down -v --remove-orphans
    docker-compose -f docker-compose.prod.yml down -v --remove-orphans
    docker rmi rider-service:latest 2>/dev/null || true
    docker system prune -f
    echo -e "${GREEN}✅ Cleanup completed!${NC}"
}

# Function to show logs
show_logs() {
    echo -e "${YELLOW}Showing RiderService logs...${NC}"
    docker logs -f rider-service 2>/dev/null || docker logs -f rider-service-prod 2>/dev/null || echo -e "${RED}❌ Container not found${NC}"
}

# Function to access container shell
access_shell() {
    echo -e "${YELLOW}Accessing container shell...${NC}"
    docker exec -it rider-service sh 2>/dev/null || docker exec -it rider-service-prod sh 2>/dev/null || echo -e "${RED}❌ Container not found${NC}"
}

# Main script logic
case "$1" in
    build)
        build_image
        ;;
    dev)
        build_image
        run_dev
        ;;
    prod)
        build_image
        run_prod
        ;;
    stop)
        stop_containers
        ;;
    clean)
        clean_up
        ;;
    logs)
        show_logs
        ;;
    shell)
        access_shell
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
