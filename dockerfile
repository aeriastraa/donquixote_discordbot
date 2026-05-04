# Use Node.js 18
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install edge-tts in a virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install edge-tts

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --omit=dev

# Copy bot files
COPY . .

# Create tmp folder
RUN mkdir -p tmp

# Start the bot
CMD ["node", "index.js"]