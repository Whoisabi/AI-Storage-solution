# Use Node.js 20 with Alpine for smaller image size
FROM node:20-alpine

# Install dependencies needed for node-gyp and native dependencies
RUN apk add --no-cache python3 make g++ postgresql-client curl bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy all source code
COPY . .

# Make entrypoint script executable
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Expose port 5000
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Use the entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "start"]