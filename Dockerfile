# Use the official Node.js 18 image as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --force

# Copy the rest of your app's source code
COPY . .

# Build your Next.js app
RUN npm run build

# Expose the port your app runs on
EXPOSE 3005

# Set environment variable
ENV NODE_ENV production
ENV SESSION_SECRET aksjcnajscnjkacnjkacsnjkn

# Start the app
CMD ["npm", "start"]