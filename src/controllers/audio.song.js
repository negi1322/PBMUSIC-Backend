import { spawn } from "child_process";

export const Song_audio = async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) return res.status(400).json({ error: "Missing video ID" });

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  console.log("▶️ Playing:", url);

  res.setHeader("Content-Type", "audio/webm");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Transfer-Encoding", "chunked");

  const ytdlp = spawn("yt-dlp", [
    "-f", "bestaudio",
    "--no-playlist",
    "--quiet",
    "--no-warnings",
    "-o", "-",  // stdout me pipe
    url,
  ]);

  ytdlp.stdout.pipe(res);  // seedha browser ko stream

  ytdlp.stderr.on("data", (d) => console.error("yt-dlp:", d.toString()));

  ytdlp.on("error", (err) => {
    console.error("❌ spawn error:", err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  });

  ytdlp.on("close", (code) => console.log("yt-dlp closed:", code));

  req.on("close", () => ytdlp.kill("SIGTERM")); // client disconnect pe kill
};