# Multi-stage build for the Restaurant Client Vite app

# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ---- Production stage ----
FROM nginx:1.27-alpine

# Copy the Vite build output to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config to enable SPA routing fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the container
EXPOSE 80

# Nginx image provides the default start command
