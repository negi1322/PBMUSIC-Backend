FROM node:20-slim

# ✅ Install system dependencies + yt-dlp (reliable method)
RUN apt-get update && apt-get install -y \
    python3 \
    ffmpeg \
    curl \
    ca-certificates \
    yt-dlp \
    && rm -rf /var/lib/apt/lists/*

# 🔍 Debug (check yt-dlp is installed)
RUN which yt-dlp && yt-dlp --version

WORKDIR /app

# ✅ Install node dependencies
COPY package*.json ./
RUN npm install --omit=dev

# ✅ Copy project files
COPY . .

# ✅ Expose port
EXPOSE 10000

CMD ["npm", "start"]