#!/bin/bash
set -e

echo "Starting file sharing application..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h database -p 5432 -U postgres; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
npm run db:push

# Start the application
echo "Starting application..."
exec "$@"