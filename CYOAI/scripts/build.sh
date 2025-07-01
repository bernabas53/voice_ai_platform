#!/bin/bash

# Voice AI Platform Production Build Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_status "Starting production build..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check for required environment variables
if [ -z "$VITE_FRAPPE_API_URL" ]; then
    print_warning "VITE_FRAPPE_API_URL not set. Using default value."
    export VITE_FRAPPE_API_URL="http://localhost:8000"
fi

if [ -z "$VITE_FRAPPE_SITE_NAME" ]; then
    print_warning "VITE_FRAPPE_SITE_NAME not set. Using default value."
    export VITE_FRAPPE_SITE_NAME="voice_ai_platform"
fi

# Set production environment
export VITE_NODE_ENV="production"
export VITE_ENABLE_ANALYTICS="true"
export VITE_ENABLE_ERROR_TRACKING="true"

print_status "Environment configured for production"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    yarn install
else
    print_status "Dependencies already installed"
fi

# Clean previous build
if [ -d "dist" ]; then
    print_status "Cleaning previous build..."
    rm -rf dist
fi

# Run type checking
print_status "Running type checking..."
if ! yarn type-check; then
    print_error "Type checking failed. Please fix type errors before building."
    exit 1
fi

# Run linting
print_status "Running linting..."
if ! yarn lint; then
    print_warning "Linting found issues. Consider fixing them before production deployment."
    read -p "Continue with build anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Build cancelled by user."
        exit 1
    fi
fi

# Run tests
print_status "Running tests..."
if ! yarn test; then
    print_warning "Tests failed. Consider fixing them before production deployment."
    read -p "Continue with build anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Build cancelled by user."
        exit 1
    fi
fi

# Build for production
print_status "Building for production..."
if ! yarn build; then
    print_error "Build failed!"
    exit 1
fi

# Copy HTML entry point
print_status "Copying HTML entry point..."
if ! yarn copy-html-entry; then
    print_error "Failed to copy HTML entry point!"
    exit 1
fi

# Generate build info
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BUILD_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo "Build completed at: $BUILD_TIME" > dist/build-info.txt
echo "Git commit: $BUILD_HASH" >> dist/build-info.txt
echo "Environment: production" >> dist/build-info.txt

# Check build output size
BUILD_SIZE=$(du -sh dist | cut -f1)
print_success "Production build completed successfully!"
print_status "Build size: $BUILD_SIZE"
print_status "Build output: ../voice_ai_platform/public/CYOAI/"
print_status "HTML entry: ../voice_ai_platform/www/CYOAI.html"

# Optional: Run bundle analyzer
if command -v npx &> /dev/null; then
    read -p "Run bundle analyzer? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Running bundle analyzer..."
        npx vite-bundle-analyzer dist
    fi
fi

print_success "Build process completed!"
