import { execFile } from "child_process";
import { promisify } from "util";
import https from "https";
import fs from "fs";

const execFileAsync = promisify(execFile);

export const Song_audio = async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).json({ error: "Missing video ID" });
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  // 👇 Local aur Docker dono ke liye
  const cookiesPath = fs.existsSync("/app/cookies.txt")
    ? "/app/cookies.txt" // Docker/Railway
    : "./cookies.txt"; // Local

  console.log("🍪 Using cookies:", cookiesPath);

  try {
    const { stdout } = await execFileAsync("yt-dlp", [
      "--dump-single-json",
      "--no-playlist",
      "--quiet",
      "--no-warnings",
      "--cookies",
      cookiesPath, // ✅ auto path
      "-f",
      "bestaudio[ext=m4a]/bestaudio",
      url,
    ]);

    const data = JSON.parse(stdout);

    const audioFormat = data.formats
      ?.filter((f) => f.acodec !== "none" && f.vcodec === "none")
      ?.sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

    const audioUrl = audioFormat?.url;

    if (!audioUrl) {
      return res.status(500).json({ error: "No audio found" });
    }

    const range = req.headers.range;

    const requestHeaders = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
      Referer: "https://www.youtube.com/",
    };

    if (range) {
      requestHeaders.Range = range;
    }

    https
      .get(audioUrl, { headers: requestHeaders }, (stream) => {
        const contentType = stream.headers["content-type"] || "audio/mp4";
        const contentLength = stream.headers["content-length"];
        const contentRange = stream.headers["content-range"];

        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Cache-Control", "no-cache");

        if (contentLength) res.setHeader("Content-Length", contentLength);
        if (contentRange) res.setHeader("Content-Range", contentRange);

        const statusCode = range && contentRange ? 206 : 200;
        res.writeHead(statusCode);

        stream.pipe(res);

        req.on("close", () => stream.destroy());
      })
      .on("error", (err) => {
        console.error("❌ Stream error:", err.message);
        if (!res.headersSent) res.status(500).json({ error: err.message });
      });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
