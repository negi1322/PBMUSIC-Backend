FROM node:20-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# 🔥 FIX HERE
RUN pip install -U yt-dlp --break-system-packages

RUN yt-dlp --version

WORKDIR /app

COPY cookies.txt /app/cookies.txt

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]