# Build stage
FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Remove package-lock.json to avoid architecture conflicts and install fresh
RUN rm -f package-lock.json && \
    npm install --legacy-peer-deps && \
    npm install @rollup/rollup-linux-arm64-gnu --save-optional --legacy-peer-deps || \
    npm install @rollup/rollup-linux-x64-gnu --save-optional --legacy-peer-deps || true

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3001
EXPOSE 3001

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
