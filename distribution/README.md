# Claude Color Distribution

Cross-platform distribution files for Claude Color.

## Installation Methods

### npm (Recommended - All Platforms)

```bash
npm install -g claude-color
```

### macOS (Homebrew)

```bash
brew tap joshleichtung/tap
brew install claude-color
```

Or using the formula directly:
```bash
brew install https://raw.githubusercontent.com/joshleichtung/claude-color/main/distribution/homebrew/claude-color.rb
```

### Windows (Chocolatey)

```powershell
choco install claude-color
```

Or using the installation script:
```powershell
iwr -useb https://raw.githubusercontent.com/joshleichtung/claude-color/main/distribution/scripts/install.ps1 | iex
```

### Linux

#### Using npm
```bash
npm install -g claude-color
```

#### Using installation script
```bash
curl -fsSL https://raw.githubusercontent.com/joshleichtung/claude-color/main/distribution/scripts/install.sh | bash
```

### Docker

Pull the image:
```bash
docker pull ghcr.io/joshleichtung/claude-color:latest
```

Run with Docker:
```bash
docker run -it --rm \
  -e ANTHROPIC_API_KEY=your_api_key \
  -v ~/.claude-color:/root/.claude-color \
  ghcr.io/joshleichtung/claude-color:latest generate --scheme complementary
```

Or use docker-compose:
```bash
cd distribution/docker
docker-compose run claude-color generate --scheme complementary
```

## Building Distribution Packages

### Homebrew Formula

1. Update version and SHA256 in `homebrew/claude-color.rb`
2. Calculate SHA256:
   ```bash
   curl -sL https://registry.npmjs.org/claude-color/-/claude-color-1.0.0.tgz | shasum -a 256
   ```
3. Submit to homebrew-tap repository

### Chocolatey Package

1. Update version in `chocolatey/claude-color.nuspec`
2. Build package:
   ```powershell
   cd distribution/chocolatey
   choco pack
   ```
3. Publish to Chocolatey:
   ```powershell
   choco push claude-color.1.0.0.nupkg --source https://push.chocolatey.org/
   ```

### Docker Image

Build the image:
```bash
cd distribution/docker
docker build -t claude-color:latest .
```

Tag for registry:
```bash
docker tag claude-color:latest ghcr.io/joshleichtung/claude-color:latest
docker tag claude-color:latest ghcr.io/joshleichtung/claude-color:1.0.0
```

Push to registry:
```bash
docker push ghcr.io/joshleichtung/claude-color:latest
docker push ghcr.io/joshleichtung/claude-color:1.0.0
```

## Installation Script Usage

### Unix (macOS, Linux)

Direct installation:
```bash
curl -fsSL https://raw.githubusercontent.com/joshleichtung/claude-color/main/distribution/scripts/install.sh | bash
```

Or download and run:
```bash
curl -fsSL -o install.sh https://raw.githubusercontent.com/joshleichtung/claude-color/main/distribution/scripts/install.sh
chmod +x install.sh
./install.sh
```

### Windows (PowerShell)

Direct installation:
```powershell
iwr -useb https://raw.githubusercontent.com/joshleichtung/claude-color/main/distribution/scripts/install.ps1 | iex
```

Or download and run:
```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/joshleichtung/claude-color/main/distribution/scripts/install.ps1 -OutFile install.ps1
.\install.ps1
```

## Requirements

- Node.js 18 or higher
- npm 9 or higher
- Anthropic API key (for AI features)

## Verification

After installation, verify:
```bash
claude-color --version
claude-color --help
```

## Uninstallation

### npm
```bash
npm uninstall -g claude-color
```

### Homebrew
```bash
brew uninstall claude-color
```

### Chocolatey
```powershell
choco uninstall claude-color
```

### Docker
```bash
docker rmi ghcr.io/joshleichtung/claude-color:latest
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/joshleichtung/claude-color/issues
- Documentation: https://github.com/joshleichtung/claude-color#readme
