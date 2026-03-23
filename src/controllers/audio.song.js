import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fetch from "node-fetch";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ✅ Works on Windows locally and Linux on Render
const YTDLP =
  process.platform === "win32"
    ? path.resolve(__dirname, "../../yt-dlp.exe")
    : "/opt/render/project/src/yt-dlp";

// ✅ Write cookies from env variable once at startup
const COOKIES_PATH = "/tmp/yt-cookies.txt";

const setupCookies = () => {
  const b64 = process.env.YT_COOKIES_B64;
  console.log("🍪 Cookie env present:", !!b64);
  if (b64 && !fs.existsSync(COOKIES_PATH)) {
    const decoded = Buffer.from(b64, "base64").toString("utf-8");
    fs.writeFileSync(COOKIES_PATH, decoded);
    console.log("✅ YouTube cookies loaded");
  }
  console.log("🍪 Cookie file exists:", fs.existsSync(COOKIES_PATH));
};

setupCookies();

export const Song_audio = async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).json({ error: "Missing video ID" });
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  // ✅ Use cookies if available
  const cookieArgs = fs.existsSync(COOKIES_PATH)
    ? ["--cookies", COOKIES_PATH]
    : [];

  try {
    // ✅ Step 1: Get direct audio URL
    const { stdout } = await execFileAsync(YTDLP, [
      ...cookieArgs,
      "--no-warnings",
      "--no-playlist",
      "-f",
      "bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio",
      "--get-url",
      url,
    ]);

    const audioUrl = stdout.trim().split("\n")[0];

    if (!audioUrl) {
      return res.status(500).json({ error: "No audio URL found" });
    }

    // ✅ Step 2: Get title + thumbnail
    const { stdout: infoOut } = await execFileAsync(YTDLP, [
      ...cookieArgs,
      "--no-warnings",
      "--no-playlist",
      "--print",
      "%(title)s\n%(thumbnail)s",
      url,
    ]);

    const [title = "", thumbnail = ""] = infoOut.trim().split("\n");

    // ✅ Step 3: Stream audio to client
    const range = req.headers.range;

    const fetchHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      Referer: "https://www.youtube.com/",
      Origin: "https://www.youtube.com",
      ...(range ? { Range: range } : {}),
    };

    const audioRes = await fetch(audioUrl, { headers: fetchHeaders });

    if (!audioRes.ok && audioRes.status !== 206) {
      return res
        .status(500)
        .json({ error: `Audio fetch failed: ${audioRes.status}` });
    }

    res.setHeader(
      "Content-Type",
      audioRes.headers.get("content-type") || "audio/webm",
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "no-cache");

    if (title) res.setHeader("X-Title", encodeURIComponent(title));
    if (thumbnail) res.setHeader("X-Thumbnail", thumbnail);

    const contentLength = audioRes.headers.get("content-length");
    const contentRange = audioRes.headers.get("content-range");

    if (contentLength) res.setHeader("Content-Length", contentLength);
    if (contentRange) res.setHeader("Content-Range", contentRange);

    res.writeHead(audioRes.status === 206 ? 206 : 200);

    audioRes.body.pipe(res);
    req.on("close", () => audioRes.body.destroy());
  } catch (err) {
    console.error("❌ Song_audio error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Streaming failed", detail: err.message });
    }
  }
};
