FROM node:20-alpine

# Install dependencies for sharp and playwright
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set environment variables for Playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install Claude Color globally
RUN npm install -g claude-color

# Create app directory
WORKDIR /app

# Set up volume for persistent data
VOLUME ["/root/.claude-color"]

# Set entrypoint to claude-color CLI
ENTRYPOINT ["claude-color"]

# Default command shows help
CMD ["--help"]
