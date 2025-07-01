# Multi-stage build for production optimization
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source and build the app
COPY . .
RUN npm run build

# Production image stage
FROM nginx:alpine AS production

# Create a non-root user
RUN apk update && apk upgrade && apk add --no-cache curl && \
    addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app to nginx's web directory and assign ownership
COPY --from=builder /app/dist /usr/share/nginx/html
RUN chown -R appuser:appgroup /usr/share/nginx/html

# Create the startup script WITHOUT runtime chown (already handled in initContainer)
RUN echo '#!/bin/sh' > /docker-entrypoint-custom.sh && \
    echo 'set -e' >> /docker-entrypoint-custom.sh && \
    echo 'mkdir -p /var/cache/nginx /var/log/nginx /tmp/nginx' >> /docker-entrypoint-custom.sh && \
    echo '# Permissions are handled by initContainer' >> /docker-entrypoint-custom.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint-custom.sh && \
    chmod +x /docker-entrypoint-custom.sh

# Set the user
USER 1001

# Expose app port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Use the custom entrypoint
ENTRYPOINT ["/docker-entrypoint-custom.sh"]