import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const YTDLP =
  process.platform === "win32"
    ? path.resolve(__dirname, "../../yt-dlp.exe")
    : path.resolve(__dirname, "../../yt-dlp");
export const Song_audio = async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).json({ error: "Missing video ID" });
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // ✅ Step 1: Get the direct audio URL from yt-dlp
    const { stdout } = await execFileAsync(YTDLP, [
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

    // ✅ Step 2: Get video title + thumbnail separately
    const { stdout: infoOut } = await execFileAsync(YTDLP, [
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

    // ✅ Forward headers
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
