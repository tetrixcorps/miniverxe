# Dockerfile for TETRIX Frontend (Astro) with SHANGO AI Super Agent
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.8.0

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Clean up any conflicting lockfiles (including nested ones)
RUN find . -name "package-lock.json" -delete && \
    find . -name "yarn.lock" -delete && \
    find . -name "npm-shrinkwrap.json" -delete && \
    find . -name ".yarnrc*" -delete

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 4321

# Start the application
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"] 