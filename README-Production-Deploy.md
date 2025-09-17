# Production Deployment Guide

This guide covers deploying the File Sharing application in production using Docker.

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Update production environment variables:**
   Edit `.env.production` with secure values:
   ```env
   POSTGRES_DB=fileshare
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=YourSecurePassword123!
   NODE_ENV=production
   PORT=5000
   ```

3. **Deploy with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

## Security Features

### Database Security
- Database port (5432) is not exposed to the host in production
- Environment variables for configurable database credentials
- Strong password defaults with option to override

### Application Security
- Production-optimized Node.js container
- Health checks for both database and application
- Proper SSL configuration for external databases

## Migration Strategy

The application uses Drizzle ORM with the following migration approach:

1. **drizzle-kit** is installed as a production dependency
2. Migrations run automatically during container startup
3. The entrypoint script waits for database readiness before running migrations
4. Robust error handling if migrations fail

### Manual Migration Commands

If you need to run migrations manually:

```bash
# Connect to the running container
docker exec -it file-share-app bash

# Run migrations
npm run db:push

# Generate new migrations (if needed)
npm run db:generate
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| POSTGRES_DB | Database name | fileshare |
| POSTGRES_USER | Database user | postgres |
| POSTGRES_PASSWORD | Database password | YourSecurePasswordHere123! |
| NODE_ENV | Node environment | production |
| PORT | Application port | 5000 |

## Health Checks

- **Database**: `pg_isready` check every 10s
- **Application**: HTTP health endpoint check every 30s
- **Startup**: 40s grace period for application startup

## Troubleshooting

### Migration Issues
Check container logs:
```bash
docker logs file-share-app
```

### Database Connection Issues
Verify database is healthy:
```bash
docker logs file-share-db
```

### Manual Database Reset
If you need to reset the database:
```bash
docker-compose down -v
docker-compose up -d
```

## Production Checklist

- [ ] Update database credentials in `.env.production`
- [ ] Verify database port is not exposed
- [ ] Check application logs for successful migration
- [ ] Test application health endpoint
- [ ] Verify file upload functionality
- [ ] Test authentication flow