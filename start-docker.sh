#!/bin/bash

# File Sharing Application - Docker Startup Script
set -e

echo "🐳 File Sharing Application - Docker Setup"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

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
        echo "🚀 Starting in PRODUCTION mode..."
        echo "Building and starting containers..."
        docker-compose up -d --build
        echo ""
        echo "✅ Application started successfully!"
        echo "🌐 Access your application at: http://localhost:3000"
        echo "📊 Database accessible at: localhost:5432"
        echo ""
        echo "Commands:"
        echo "  View logs: docker-compose logs -f"
        echo "  Stop:      docker-compose down"
        ;;
        
    "dev"|"development")
        echo "🛠️  Starting in DEVELOPMENT mode..."
        echo "Building and starting containers with hot reload..."
        docker-compose -f docker-compose.dev.yml up -d --build
        echo ""
        echo "✅ Development environment started successfully!"
        echo "🌐 Access your application at: http://localhost:3000"
        echo "📊 Database accessible at: localhost:5432"
        echo "⚡ Hot reload enabled for development"
        echo ""
        echo "Commands:"
        echo "  View logs: docker-compose -f docker-compose.dev.yml logs -f"
        echo "  Stop:      docker-compose -f docker-compose.dev.yml down"
        ;;
        
    "stop")
        echo "🛑 Stopping all containers..."
        docker-compose down 2>/dev/null || true
        docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
        echo "✅ All containers stopped."
        ;;
        
    "logs")
        echo "📋 Showing logs..."
        if docker-compose ps | grep -q "file-share-app"; then
            docker-compose logs -f
        elif docker-compose -f docker-compose.dev.yml ps | grep -q "file-share-app-dev"; then
            docker-compose -f docker-compose.dev.yml logs -f
        else
            echo "❌ No containers are currently running."
        fi
        ;;
        
    "restart")
        echo "🔄 Restarting application..."
        docker-compose restart app 2>/dev/null || docker-compose -f docker-compose.dev.yml restart app 2>/dev/null || echo "No containers to restart"
        echo "✅ Application restarted."
        ;;
        
    "clean")
        echo "🧹 Cleaning up containers and volumes..."
        echo "⚠️  WARNING: This will delete all data in the database!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v 2>/dev/null || true
            docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
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