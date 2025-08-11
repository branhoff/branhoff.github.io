#!/bin/bash

# Stop and remove any existing container first
echo "Cleaning up existing container..."
docker stop branhoff-web-dev 2>/dev/null || true
docker rm branhoff-web-dev 2>/dev/null || true

# Build the development image
echo "Building web development container..."
if ! docker build -f Dockerfile.dev -t web-dev:latest .; then
    echo "Build failed! Exiting..." >&2
    exit 1
fi

# Debug: Show what we're mounting
echo "================================================================"
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la
echo "================================================================"

echo "Starting web development container..."
echo "Access your site at:"
echo "  - http://localhost:8000 (basic server)"
echo "  - http://localhost:8080 (live-reload server)"
echo ""
echo "To access the container shell:"
echo "  docker exec -it branhoff-web-dev /bin/zsh"
echo ""
echo "Inside the container, use:"
echo "  webdev live    # Start live-reload server"
echo "  webdev serve   # Start basic server"  
echo "  webdev format  # Format your code"
echo "================================================================"

# Run container with volume mounting
if ! docker run -d \
  --name branhoff-web-dev \
  -p 8000:8000 \
  -p 8080:8080 \
  -v "$(pwd):/home/devuser/workspace" \
  web-dev:latest; then
    echo "Failed to start container! Exiting..." >&2
    exit 1
fi

echo "Container started! Basic server running on port 8000."
echo ""
echo "Verify the mount worked:"
echo "  docker exec branhoff-web-dev ls -la /home/devuser/workspace"
echo ""
echo "Access the shell:"
echo "  docker exec -it branhoff-web-dev /bin/zsh"