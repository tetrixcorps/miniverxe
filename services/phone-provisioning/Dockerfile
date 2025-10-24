# TETRIX Phone Provisioning Service Dockerfile
FROM node:20-alpine

# Install pnpm and curl
RUN npm install -g pnpm && apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies with multiple retry attempts
RUN for i in 1 2 3; do \
        pnpm config set fetch-retries 10 && \
        pnpm config set fetch-retry-factor 2 && \
        pnpm config set fetch-retry-mintimeout 10000 && \
        pnpm config set fetch-retry-maxtimeout 120000 && \
        pnpm install --frozen-lockfile=false && break || \
        (echo "Attempt $i failed, retrying..." && sleep 10); \
    done

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN pnpm run build

# Create logs directory
RUN mkdir -p /app/logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S tetrix -u 1001

# Change ownership of the app directory
RUN chown -R tetrix:nodejs /app
USER tetrix

# Expose port
EXPOSE 4002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4002/health || exit 1

# Start the application
CMD ["pnpm", "start"]
