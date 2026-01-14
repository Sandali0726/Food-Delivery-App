# Multi-stage Dockerfile for React frontend

# 1) Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm install --frozen-lockfile; \
    else npm install; fi

ARG REACT_APP_RESTAURANT_URL
ARG REACT_APP_CUSTOMER_URL
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_GOOGLE_CLIENT_SECRET
ARG REACT_APP_MAPBOX_TOKEN
# Copy source and build
COPY . .

# Export ARGs to environment so the build can read them
ENV REACT_APP_RESTAURANT_URL=${REACT_APP_RESTAURANT_URL}
ENV REACT_APP_CUSTOMER_URL=${REACT_APP_CUSTOMER_URL}
ENV REACT_APP_GOOGLE_CLIENT_ID=${REACT_APP_GOOGLE_CLIENT_ID}
ENV REACT_APP_GOOGLE_CLIENT_SECRET=${REACT_APP_GOOGLE_CLIENT_SECRET}
ENV REACT_APP_MAPBOX_TOKEN=${REACT_APP_MAPBOX_TOKEN}

# Build static assets
RUN npm run build

# 2) Runtime stage: Nginx serving static files
FROM nginx:1.25-alpine AS runtime

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static build output
COPY --from=build /app/build /usr/share/nginx/html

# Expose web port
EXPOSE 80

# Health check: try fetching index
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
