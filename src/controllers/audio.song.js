import { execFile } from "child_process";
import { promisify } from "util";
import fetch from "node-fetch";
import fs from "fs";

const YTDLP = "yt-dlp";
const execFileAsync = promisify(execFile);

// ✅ Create cookies file from env (only once)
const COOKIE_PATH = "/tmp/cookies.txt";

if (process.env.YT_COOKIES_B64 && !fs.existsSync(COOKIE_PATH)) {
  fs.writeFileSync(
    COOKIE_PATH,
    Buffer.from(process.env.YT_COOKIES_B64, "base64").toString(),
  );
  console.log("✅ Cookies loaded");
}

export const Song_audio = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing video ID" });

  const url = `https://www.youtube.com/watch?v=${id}`;

  try {
    const args = [
      "--no-warnings",
      "--no-playlist",
      "-f",
      "bestaudio/best",
      "--user-agent",
      "Mozilla/5.0",
      "--extractor-args",
      "youtube:player_client=android,web",
    ];

    // ✅ Use cookies if available
    if (fs.existsSync(COOKIE_PATH)) {
      args.push("--cookies", COOKIE_PATH);
    }

    args.push("--get-url", url);

    const { stdout } = await execFileAsync(YTDLP, args);

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
