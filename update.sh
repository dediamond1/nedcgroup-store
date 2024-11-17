#!/bin/bash

# Stop execution on error
set -e

echo "Starting the update process..."

# Step 1: Pull the latest changes from the Git repository
echo "Pulling the latest changes from the Git repository..."
git pull origin main

# Step 2: Install or update dependencies
echo "Installing/updating dependencies..."
npm install

# Step 3: Build the Remix project
echo "Building the Remix project..."
npm run build

# Step 4: Build the Docker image
echo "Building the Docker image..."
docker build -t lager-nedcgroup .

# Step 5: Restart the Docker container
echo "Stopping the old container..."
docker stop lager-nedcgroup || true

echo "Removing the old container..."
docker rm lager-nedcgroup || true

echo "Starting a new container..."
docker run -d --name lager-nedcgroup -p 3005:3005 lager-nedcgroup

echo "Update process completed successfully!"
