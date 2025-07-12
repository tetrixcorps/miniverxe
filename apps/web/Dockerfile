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
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]

# --- Development stage ---
FROM base AS development
ENV NODE_ENV=development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# --- Default to production ---
FROM production AS final 