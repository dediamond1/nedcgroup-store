# Step 1: Build Stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy application source code
COPY . .

# Build the Remix application
RUN npm run build

# Prune dev dependencies to minimize image size
RUN npm prune --production

# Step 2: Runtime Stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy production dependencies and built files from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Set environment to production
ENV NODE_ENV=production

# Expose the port Remix runs on
EXPOSE 3005

# Command to run the application
CMD ["npm", "start"]
