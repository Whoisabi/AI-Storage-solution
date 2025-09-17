#!/bin/bash

# File Sharing Application - Docker Startup Script
set -e

echo "🐳 File Sharing Application - Docker Setup"
echo "=========================================="

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if docker-compose is available (try both v1 and v2)
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo -e "${RED}❌ docker-compose is not installed. Please install docker-compose and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}Using: $DOCKER_COMPOSE_CMD${NC}"

# Function to check port availability
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Warning: Port $port is already in use${NC}"
        return 1
    fi
    return 0
}

# Function to wait for service health
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}⏳ Waiting for $service to be healthy...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        # Try to find the service in both production and dev compose files
        local status=""
        if $DOCKER_COMPOSE_CMD ps --services 2>/dev/null | grep -q "$service"; then
            status=$($DOCKER_COMPOSE_CMD ps "$service" 2>/dev/null | grep -o "healthy\|unhealthy\|starting" | head -1)
        elif $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml ps --services 2>/dev/null | grep -q "$service"; then
            status=$($DOCKER_COMPOSE_CMD -f docker-compose.dev.yml ps "$service" 2>/dev/null | grep -o "healthy\|unhealthy\|starting" | head -1)
        fi
        
        if [ "$status" = "healthy" ]; then
            echo -e "${GREEN}✅ $service is healthy!${NC}"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts - $service status: ${status:-starting}..."
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ $service failed to become healthy within timeout${NC}"
    return 1
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [MODE]"
    echo ""
    echo "Modes:"
    echo "  prod, production    - Start in production mode (default)"
    echo "  dev, development    - Start in development mode with hot reload"
    echo "  stop               - Stop all containers"
    echo "  logs               - View logs"
    echo "  restart            - Restart the application"
    echo "  clean              - Stop containers and remove volumes (⚠️  deletes data)"
    echo ""
    echo "Examples:"
    echo "  ./start-docker.sh                    # Start in production mode"
    echo "  ./start-docker.sh dev                # Start in development mode"
    echo "  ./start-docker.sh stop               # Stop all containers"
    echo "  ./start-docker.sh logs               # View logs"
    echo ""
}

# Get mode from first argument, default to production
MODE=${1:-prod}

case $MODE in
    "prod"|"production")
        echo -e "${BLUE}🚀 Starting in PRODUCTION mode...${NC}"
        
        # Check port availability
        check_port 3000 || echo -e "${YELLOW}⚠️  Continuing anyway...${NC}"
        check_port 5432 || echo -e "${YELLOW}⚠️  Continuing anyway...${NC}"
        
        echo "Building and starting containers..."
        if $DOCKER_COMPOSE_CMD up -d --build; then
            echo ""
            wait_for_service "database"
            wait_for_service "app"
            echo ""
            echo -e "${GREEN}✅ Application started successfully!${NC}"
            echo -e "${GREEN}🌐 Access your application at: http://localhost:3000${NC}"
            echo -e "${BLUE}📊 Database runs inside Docker network (not exposed to host for security)${NC}"
            echo ""
            echo "Commands:"
            echo "  View logs: $DOCKER_COMPOSE_CMD logs -f"
            echo "  Stop:      $DOCKER_COMPOSE_CMD down"
            echo "  Status:    $DOCKER_COMPOSE_CMD ps"
        else
            echo -e "${RED}❌ Failed to start containers${NC}"
            exit 1
        fi
        ;;
        
    "dev"|"development")
        echo -e "${BLUE}🛠️  Starting in DEVELOPMENT mode...${NC}"
        
        # Check port availability  
        check_port 3000 || echo -e "${YELLOW}⚠️  Continuing anyway...${NC}"
        check_port 5432 || echo -e "${YELLOW}⚠️  Continuing anyway...${NC}"
        check_port 5173 || echo -e "${YELLOW}⚠️  Continuing anyway...${NC}"
        
        echo "Building and starting containers with hot reload..."
        if $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml up -d --build; then
            echo ""
            wait_for_service "database"
            wait_for_service "app"
            echo ""
            echo -e "${GREEN}✅ Development environment started successfully!${NC}"
            echo -e "${GREEN}🌐 Access your application at: http://localhost:3000${NC}"
            echo -e "${GREEN}📊 Database accessible at: localhost:5432${NC}"
            echo -e "${GREEN}⚡ Hot reload enabled for development${NC}"
            echo ""
            echo "Commands:"
            echo "  View logs: $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml logs -f"
            echo "  Stop:      $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml down"
            echo "  Status:    $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml ps"
        else
            echo -e "${RED}❌ Failed to start development containers${NC}"
            exit 1
        fi
        ;;
        
    "stop")
        echo "🛑 Stopping all containers..."
        $DOCKER_COMPOSE_CMD down 2>/dev/null || true
        $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml down 2>/dev/null || true
        echo "✅ All containers stopped."
        ;;
        
    "logs")
        echo "📋 Showing logs..."
        if $DOCKER_COMPOSE_CMD ps | grep -q "file-share-app"; then
            $DOCKER_COMPOSE_CMD logs -f
        elif $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml ps | grep -q "file-share-app-dev"; then
            $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml logs -f
        else
            echo "❌ No containers are currently running."
        fi
        ;;
        
    "restart")
        echo "🔄 Restarting application..."
        $DOCKER_COMPOSE_CMD restart app 2>/dev/null || $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml restart app 2>/dev/null || echo "No containers to restart"
        echo "✅ Application restarted."
        ;;
        
    "clean")
        echo "🧹 Cleaning up containers and volumes..."
        echo "⚠️  WARNING: This will delete all data in the database!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            $DOCKER_COMPOSE_CMD down -v 2>/dev/null || true
            $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml down -v 2>/dev/null || true
            docker system prune -f
            echo "✅ Cleanup completed."
        else
            echo "❌ Cleanup cancelled."
        fi
        ;;
        
    "help"|"-h"|"--help")
        show_usage
        ;;
        
    *)
        echo "❌ Unknown mode: $MODE"
        echo ""
        show_usage
        exit 1
        ;;
esac