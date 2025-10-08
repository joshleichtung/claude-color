#!/bin/bash

# Installation script for Unix-like systems (macOS, Linux)

set -e

echo "🎨 Claude Color Installer"
echo "=========================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js 18 or higher from https://nodejs.org"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required."
    echo "Current version: $(node -v)"
    echo "Please upgrade Node.js from https://nodejs.org"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo ""

# Install via npm
echo "📦 Installing Claude Color..."
npm install -g claude-color

echo ""
echo "✅ Installation complete!"
echo ""
echo "🚀 Quick start:"
echo "  claude-color generate --scheme complementary"
echo "  claude-color --help"
echo ""
echo "📚 Documentation: https://github.com/joshleichtung/claude-color"
