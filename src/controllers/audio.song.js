import { execFile } from "child_process";
import { promisify } from "util";
import fetch from "node-fetch";

// const YTDLP = "yt-dlp";
const YTDLP = "/usr/local/bin/yt-dlp";
const execFileAsync = promisify(execFile);

export const Song_audio = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing video ID" });

  const url = `https://www.youtube.com/watch?v=${id}`;

  try {
    const { stdout } = await execFileAsync(YTDLP, [
      "--no-warnings",
      "--no-playlist",
      "-f",
      "bestaudio/best",
      "--user-agent",
      "Mozilla/5.0",
      "--extractor-args",
      "youtube:player_client=android,web",
      "--get-url",
      url,
    ]);

    const audioUrl = stdout.trim();
    if (!audioUrl) throw new Error("No audio URL");

    // ✅ Stream audio
    const audioRes = await fetch(audioUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://www.youtube.com/",
      },
    });

    res.setHeader(
      "Content-Type",
      audioRes.headers.get("content-type") || "audio/webm",
    );
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.writeHead(audioRes.status);
    audioRes.body.pipe(res);

    req.on("close", () => audioRes.body.destroy());
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Streaming failed" });
  }
};
