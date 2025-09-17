#!/bin/bash
set -e

echo "Starting file sharing application..."

# Set Docker environment flag for database detection
export DOCKER_ENV=true

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h database -p 5432 -U postgres; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "Database is ready!"

# Run database migrations with correct database URL for Docker
echo "Running database migrations..."
DRIZZLE_DATABASE_URL="$DATABASE_URL" npm run db:push

# Start the application
echo "Starting application..."
exec "$@"