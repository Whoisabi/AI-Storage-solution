# Docker Setup for File Sharing Application

This Docker setup provides a complete local development and production environment for the file sharing application.

## 🚀 Quick Start

### Production Setup
```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The application will be available at: **http://localhost:3000**

### Development Setup (with hot reload)
```bash
# Build and start in development mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop the application
docker-compose -f docker-compose.dev.yml down
```

## 📋 What's Included

### Services
- **App Container**: Node.js application with Express backend and React frontend
- **Database Container**: PostgreSQL 15 with persistent data storage
- **Health Checks**: Automatic health monitoring for all services
- **Networking**: Isolated Docker network for secure communication

### Features
- ✅ **Full-stack application** (Frontend + Backend)
- ✅ **PostgreSQL database** with automatic setup
- ✅ **Persistent data storage** using Docker volumes
- ✅ **Health monitoring** with automatic restart
- ✅ **Development mode** with hot reload
- ✅ **Production optimized** builds
- ✅ **Database migrations** run automatically

## 🛠️ Configuration

### Environment Variables
The Docker setup automatically configures:
- `DATABASE_URL`: Connection string for PostgreSQL
- `NODE_ENV`: Environment (development/production)
- `PORT`: Application port (5000)

### Ports
- **3000**: Application access port
- **5432**: PostgreSQL database (exposed for debugging)
- **5173**: Vite development server (dev mode only)

## 📊 Database

The PostgreSQL database is automatically:
- Created with the name `fileshare`
- Initialized with required tables via migrations
- Configured with health checks
- Backed by persistent Docker volumes

### Database Access
```bash
# Connect to database from host
psql -h localhost -p 5432 -U postgres -d fileshare

# Or connect from within the container
docker-compose exec database psql -U postgres -d fileshare
```

## 🔧 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :5432

# Use different ports if needed
docker-compose up -p 8000:5000
```

**Database connection issues:**
```bash
# Check database health
docker-compose exec database pg_isready -U postgres

# View database logs
docker-compose logs database
```

**Application logs:**
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app
docker-compose logs database

# Follow logs in real-time
docker-compose logs -f app
```

### Rebuilding
```bash
# Rebuild after code changes (production)
docker-compose build
docker-compose up -d

# Full rebuild with no cache
docker-compose build --no-cache
```

## 🚨 Important Notes

1. **Data Persistence**: Database data persists between container restarts via Docker volumes
2. **Network Security**: All communication between containers is isolated within Docker network
3. **Health Monitoring**: Containers automatically restart if health checks fail
4. **Development vs Production**: Use appropriate compose file for your needs

## 🆘 Commands Cheat Sheet

```bash
# Production
docker-compose up -d              # Start in background
docker-compose down               # Stop and remove containers
docker-compose down -v            # Stop and remove containers + volumes (⚠️ deletes data)
docker-compose logs -f            # Follow logs
docker-compose restart app        # Restart just the app
docker-compose build --no-cache   # Rebuild from scratch

# Development
docker-compose -f docker-compose.dev.yml up    # Start dev mode
docker-compose -f docker-compose.dev.yml down  # Stop dev mode
docker-compose -f docker-compose.dev.yml logs  # View dev logs
```

## 📁 Docker Files Structure
```
├── Dockerfile              # Production container
├── Dockerfile.dev          # Development container  
├── docker-compose.yml      # Production setup
├── docker-compose.dev.yml  # Development setup
├── docker-entrypoint.sh    # Container startup script
├── .dockerignore           # Files to exclude from build
└── init-db.sql            # Database initialization
```