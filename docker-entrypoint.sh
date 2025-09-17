#!/bin/bash
set -e

echo "Starting file sharing application..."

# Set Docker environment flag for database detection
export DOCKER_ENV=true

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h database -p 5432 -U ${POSTGRES_USER:-postgres}; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "Database is ready!"

# Run database migrations using Node.js runtime (no CLI tools required)
echo "Running database migrations..."
if ! node server/migrate.js; then
    echo "❌ Database migration failed!"
    exit 1
fi

# Start the application
echo "Starting application..."
exec "$@"