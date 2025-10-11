# TETRIX OAuth Authentication Service Dockerfile
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

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
EXPOSE 4003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4003/health || exit 1

# Start the application
CMD ["pnpm", "start"]
