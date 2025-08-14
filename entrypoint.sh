#!/bin/bash
echo "=== Web Development Container ==="
echo "Starting Node.js HTTP server on port 8000..."
echo "Access your site at: http://localhost:8000"

cd /home/devuser/workspace
http-server -p 8000 --host 0.0.0.0 &
SERVER_PID=$!

cleanup() {
    kill $SERVER_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

exec "$@"