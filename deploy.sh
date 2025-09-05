#!/bin/bash

# Build the React app
echo "Building React app..."
npm install
npm run build

# Install server dependencies
echo "Installing server dependencies..."
cp package-server.json package-server-backup.json
npm install express

# Start the server
echo "Starting server on port 5000..."
node server.js