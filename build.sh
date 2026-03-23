#!/bin/bash
echo "📦 Installing dependencies..."
npm install

echo "⬇️ Downloading yt-dlp (Linux)..."
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp
chmod +x yt-dlp

echo "✅ yt-dlp ready"