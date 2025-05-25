# frontend/Dockerfile
FROM node:23.11.0-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN yarn

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["yarn", "dev"]