FROM node:20-slim

# ✅ Install dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# ✅ Install latest yt-dlp (VERY IMPORTANT)
RUN pip install --no-cache-dir -U yt-dlp --break-system-packages

# ✅ Install JS runtime for yt-dlp (fixes YouTube issues)
RUN yt-dlp --install-js-runtime node || true
RUN pip install -U yt-dlp --break-system-packages
RUN which yt-dlp
WORKDIR /app

# ✅ Install node deps first (better caching)
COPY package*.json ./
RUN npm install --omit=dev

# ❌ REMOVE cookies copy (not reliable on Render)
# COPY cookies.txt /app/cookies.txt

# ✅ Copy rest of code
COPY . .

# ✅ Expose port (Render uses 10000 usually)
EXPOSE 10000

CMD ["npm", "start"]