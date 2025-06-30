#!/bin/bash

# Voice AI Platform Production Build Script

set -e

echo "🚀 Starting production build..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

# Run type checking
echo "🔍 Running type checking..."
yarn type-check

# Run linting
echo "🧹 Running linting..."
yarn lint

# Run tests
echo "🧪 Running tests..."
yarn test

# Build for production
echo "🏗️ Building for production..."
yarn build

# Copy HTML entry point
echo "📋 Copying HTML entry point..."
yarn copy-html-entry

echo "✅ Production build completed successfully!"
echo "📁 Build output: ../voice_ai_platform/public/CYOAI/"
echo "🌐 HTML entry: ../voice_ai_platform/www/CYOAI.html"
