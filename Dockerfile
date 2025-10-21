# Dockerfile for TETRIX Authentication System
# This provides complete control over the build process without buildpack caching

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.18.3

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Clear any existing node_modules and install dependencies fresh
RUN rm -rf node_modules && \
    pnpm install --frozen-lockfile --force

# Copy source code
COPY . .

# Clear build artifacts and build the application
RUN rm -rf dist .astro node_modules/.cache && \
    pnpm run build

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Start the application
CMD ["pnpm", "start"]