# --- Base image ---
FROM node:18 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- Build stage ---
FROM base AS build
RUN npm run build

# --- Production stage ---
FROM node:18 AS production
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
RUN npm install --omit=dev --ignore-scripts
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]

# --- Development stage ---
FROM base AS development
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# --- Default to production ---
FROM production AS final 