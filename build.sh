#!/bin/bash

# Render Deployment Script
# This script ensures proper build process for the ERP system

echo "🚀 Starting ERP System deployment build..."

# Set environment to production
export NODE_ENV=production

# Log environment
echo "📍 Current directory: $(pwd)"
echo "📁 Directory contents:"
ls -la

# Build frontend first
echo "🎨 Building frontend..."
cd frontend
npm install --production=false
npm run build

# Check if build was successful
if [ -d "build" ]; then
    echo "✅ Frontend build successful"
    echo "📦 Frontend build contents:"
    ls -la build/
else
    echo "❌ Frontend build failed - build directory not found"
    exit 1
fi

# Return to root and install backend dependencies
cd ..
echo "🔧 Installing backend dependencies..."
cd backend
npm install --production=false

# Verify server.js exists
if [ -f "server.js" ]; then
    echo "✅ Backend server.js found"
else
    echo "❌ Backend server.js not found"
    exit 1
fi

echo "🎉 Build process completed successfully"
echo "📋 Final directory structure:"
cd ..
find . -name "build" -type d
find . -name "server.js" -type f