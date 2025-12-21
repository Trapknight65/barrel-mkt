# Root Dockerfile for Render deployment
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache dos2unix
COPY backend/package*.json ./
RUN dos2unix package*.json && npm ci
COPY backend/ ./
RUN find . -type f -name "*.ts" -exec dos2unix {} \; && \
    # Build the application using node directly via JS entry point
    node node_modules/@nestjs/cli/bin/nest.js build

FROM node:20-alpine AS production
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001
CMD ["node", "dist/main.js"]
