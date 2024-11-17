# 1. Use the official Node.js image as a base
FROM node:18-alpine AS builder

# 2. Set the working directory
WORKDIR /app

# 3. Copy package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package.json package-lock.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the application code
COPY . .

# 6. Build the Remix application
RUN npm run build

# 7. Install only production dependencies
RUN npm prune --production

# 8. Use a smaller image for the runtime
FROM node:18-alpine

# 9. Set the working directory
WORKDIR /app

# 10. Copy only the production dependencies and build files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# 11. Expose the port Remix runs on
EXPOSE 3005

# 12. Command to start the server
CMD ["npm", "start"]
