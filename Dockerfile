# Root Dockerfile for Render deployment
# Builds the NestJS backend

FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache dos2unix

# Copy backend package files
COPY backend/package*.json ./

# Fix line endings and install
RUN dos2unix package*.json 2>/dev/null || true
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Fix line endings in sources and build
RUN find . -type f -name "*.ts" -exec dos2unix {} \; 2>/dev/null || true
RUN find . -type f -name "*.json" -exec dos2unix {} \; 2>/dev/null || true

# Build the application using node directly to avoid permission issues on the script
RUN node node_modules/.bin/nest build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/main.js"]
