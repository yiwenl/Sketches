#!/bin/bash

# Migration script for v2 to v3
echo "Setting up v3 migration..."

# Copy assets from root to public
echo "Copying assets..."
cp ../favicon.ico public/ 2>/dev/null || echo "favicon.ico not found"
cp ../coverSketches.jpg public/ 2>/dev/null || echo "coverSketches.jpg not found"
cp -r ../assets public/ 2>/dev/null || echo "assets directory not found"

# Install dependencies
echo "Installing dependencies..."
npm install

echo "Migration setup complete!"
echo "Run 'npm run dev' to start the development server" 