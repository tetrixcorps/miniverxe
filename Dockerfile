# Dockerfile for TETRIX Authentication System
# This completely bypasses the Heroku shim layer and buildpack caching
# DigitalOcean App Platform will automatically use this instead of buildpacks

FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies and pnpm
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm@10.18.3

# Copy package files first for better Docker layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies with no cache to ensure fresh install
RUN pnpm install --frozen-lockfile --force --no-optional

# Copy source code
COPY . .

# Clear all cache directories and build artifacts
RUN rm -rf dist .astro node_modules/.cache .pnpm-store

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV TETRIX_DOMAIN=https://tetrixcorp.com

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Start the application
CMD ["pnpm", "start"]