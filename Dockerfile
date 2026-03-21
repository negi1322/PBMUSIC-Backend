FROM node:20-slim

# 🔥 system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# 🔥 install latest yt-dlp via pip (IMPORTANT FIX)
RUN pip install -U yt-dlp

# 🔥 verify version
RUN yt-dlp --version

WORKDIR /app

# optional cookies (won't break build if missing)
COPY cookies.txt /app/cookies.txt

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]