#!/bin/bash

# Server restart script for Enterprise ERP System
# This script restarts the server, clearing any model caching issues

echo "🔄 Restarting Enterprise ERP System server..."

# Change to the backend directory
cd "$(dirname "$0")/../backend"

# Kill any existing node process (adjust as needed)
echo "Stopping existing Node.js processes..."
pkill -f "node server.js" || true

# Clear node cache
echo "Clearing Node.js cache..."
npm cache clean --force

# Restart the server
echo "Starting server..."
npm start

echo "✅ Server restart complete!"
