# Dockerfile for Playwright E2E tests
FROM mcr.microsoft.com/playwright:v1.53.0-jammy

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Run Playwright tests by default
CMD ["npx", "playwright", "test"] 