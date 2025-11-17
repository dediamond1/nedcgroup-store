# Use the official Node.js 20 image as a parent image
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of your app's source code
COPY . .

# Build your Remix app
RUN pnpm build

# Expose the port your app runs on
EXPOSE 3005

# Set environment variables
ENV NODE_ENV=production
ENV SESSION_SECRET=aksjcnajscnjkacnjkacsnjkn

# Start the app
CMD ["pnpm", "start"]