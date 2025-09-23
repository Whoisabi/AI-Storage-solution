#!/bin/bash

# Test script for Docker setup
echo "🧪 Testing Docker setup for File Sharing Application"
echo "=================================================="

# Detect docker-compose command (try both v1 and v2)
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Detect which compose file is running
if $DOCKER_COMPOSE_CMD ps | grep -q "file-share-app-dev"; then
    COMPOSE_FILE="-f docker-compose.dev.yml"
    echo "🔍 Detected: Development environment"
elif $DOCKER_COMPOSE_CMD ps | grep -q "file-share-app"; then
    COMPOSE_FILE=""
    echo "🔍 Detected: Production environment"
else
    echo "❌ No containers are running. Please start the application first."
    exit 1
fi

# Function to test database connection
test_db_connection() {
    echo "Testing database connection..."
    if $DOCKER_COMPOSE_CMD $COMPOSE_FILE exec -T database psql -U postgres -d fileshare -c "SELECT 1;" &>/dev/null; then
        echo "✅ Database connection successful"
        return 0
    else
        echo "❌ Database connection failed"
        return 1
    fi
}

# Function to test application health
test_app_health() {
    echo "Testing application health endpoint..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/api/health &>/dev/null; then
            echo "✅ Application health check passed"
            return 0
        fi
        if [ $attempt -eq 1 ]; then
            echo "Waiting for application to be ready..."
        fi
        sleep 2
        ((attempt++))
    done
    
    echo "❌ Application health check failed after $max_attempts attempts"
    echo "Application logs:"
    $DOCKER_COMPOSE_CMD $COMPOSE_FILE logs --tail=20 app 2>/dev/null || echo "No logs available"
    return 1
}

# Function to test database migrations
test_migrations() {
    echo "Testing database table creation..."
    if $DOCKER_COMPOSE_CMD $COMPOSE_FILE exec -T database psql -U postgres -d fileshare -c "\dt" | grep -q "users\|files\|folders\|sessions"; then
        echo "✅ Database tables exist (migrations successful)"
        return 0
    else
        echo "❌ Database tables missing (migrations may have failed)"
        return 1
    fi
}

# Run tests
echo ""
echo "Running tests..."
echo "----------------"

PASSED=0
TOTAL=3

test_db_connection && ((PASSED++))
test_app_health && ((PASSED++))
test_migrations && ((PASSED++))

echo ""
echo "Test Results: $PASSED/$TOTAL tests passed"

if [ $PASSED -eq $TOTAL ]; then
    echo "🎉 All tests passed! Docker setup is working correctly."
    exit 0
else
    echo "⚠️  Some tests failed. Please check the logs."
    echo "Useful debugging commands:"
    echo "  $DOCKER_COMPOSE_CMD $COMPOSE_FILE logs app"
    echo "  $DOCKER_COMPOSE_CMD $COMPOSE_FILE logs database"
    echo "  $DOCKER_COMPOSE_CMD $COMPOSE_FILE ps"
    exit 1
fi