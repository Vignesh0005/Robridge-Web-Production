#!/bin/bash
# Build script for React app on Render.com

echo "🚀 Building RobBridge Frontend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the app
echo "🔨 Building React app..."
npm run build

echo "✅ Build completed successfully!"
