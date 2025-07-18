FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 8080

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S echocloud -u 1001

# Switch to non-root user
USER echocloud

# Start the application
CMD ["node", "dist/index.js"]
