#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Pull the latest changes from the git repository
git pull

# Build the Docker image
docker build -t nedcgroup-lager .

# Stop the running container
docker stop nedcgroup-lager || true

# Remove the old container
docker rm nedcgroup-lager || true

# Run the new container
docker run -d --name nedcgroup-lager -p 8067:3000 nedcgroup-lager

# Print the status
echo "Update completed successfully!"