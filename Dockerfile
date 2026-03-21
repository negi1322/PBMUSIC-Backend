FROM node:20-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# yt-dlp latest version pip se
RUN pip install -U yt-dlp --break-system-packages

# 👇 Node.js JS runtime register karo yt-dlp ke saath
RUN yt-dlp --install-js-runtime node || true

RUN yt-dlp --version

WORKDIR /app

COPY cookies.txt /app/cookies.txt
RUN ls -la /app/cookies.txt && echo "✅ Cookies found" || echo "❌ Cookies missing"

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]