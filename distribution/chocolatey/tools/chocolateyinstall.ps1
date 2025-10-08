$ErrorActionPreference = 'Stop'

$packageName = 'claude-color'
$toolsDir = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"

# Install via npm
npm install -g claude-color

Write-Host "Claude Color has been installed successfully!"
Write-Host "Run 'claude-color --help' to get started."
