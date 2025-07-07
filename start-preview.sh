#!/bin/bash

echo "🚀 Starting RemoteConnect Preview..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

echo "🎉 All dependencies installed successfully!"
echo ""
echo "🌟 Starting development servers..."
echo "   - Backend: http://localhost:3001"
echo "   - Frontend: http://localhost:5173"
echo "   - Demo: http://localhost:5173/demo"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

# Start both servers
npm run dev
