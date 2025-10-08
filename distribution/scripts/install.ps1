# Installation script for Windows

$ErrorActionPreference = 'Stop'

Write-Host "🎨 Claude Color Installer" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check for Node.js
try {
    $nodeVersion = node -v
    Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js 18 or higher from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Check Node.js version
$versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($versionNumber -lt 18) {
    Write-Host "❌ Node.js version 18 or higher is required." -ForegroundColor Red
    Write-Host "Current version: $nodeVersion" -ForegroundColor Yellow
    Write-Host "Please upgrade Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Install via npm
Write-Host "📦 Installing Claude Color..." -ForegroundColor Cyan
npm install -g claude-color

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Quick start:" -ForegroundColor Cyan
Write-Host "  claude-color generate --scheme complementary"
Write-Host "  claude-color --help"
Write-Host ""
Write-Host "📚 Documentation: https://github.com/joshleichtung/claude-color" -ForegroundColor Cyan
