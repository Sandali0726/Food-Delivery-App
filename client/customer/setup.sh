#!/bin/bash

# Yumi Customer Frontend - Installation Script
# This script will set up the project and start the development server

echo "🍔 Welcome to Yumi Customer Frontend Setup!"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the customer-frontend directory"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
echo "This may take a few minutes..."
echo ""

npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: npm install failed!"
    echo "Please check your Node.js installation and try again"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Step 2: Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo "⚠️  Please update the .env file with your configuration"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

echo "🎉 Setup Complete!"
echo ""
echo "============================================"
echo "📖 Quick Reference:"
echo "============================================"
echo ""
echo "Start development server:"
echo "  npm start"
echo ""
echo "Build for production:"
echo "  npm run build"
echo ""
echo "Run tests:"
echo "  npm test"
echo ""
echo "============================================"
echo "📚 Documentation Files:"
echo "============================================"
echo ""
echo "  README.md           - Full documentation"
echo "  QUICK_START.md      - Quick setup guide"
echo "  PROJECT_SUMMARY.md  - Feature list"
echo "  APP_FLOW.md         - Visual diagrams"
echo "  CHECKLIST.md        - Development roadmap"
echo ""
echo "============================================"
echo ""

# Ask if user wants to start the dev server
read -p "Would you like to start the development server now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting development server..."
    echo "The app will open at http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    npm start
else
    echo ""
    echo "👍 You can start the server later with: npm start"
    echo ""
    echo "Happy coding! 🎉"
fi

