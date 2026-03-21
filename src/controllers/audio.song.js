// import { execFile } from "child_process";
// import { promisify } from "util";
// import https from "https";
// import fs from "fs";

// const execFileAsync = promisify(execFile);

// export const Song_audio = async (req, res) => {
//   const videoId = req.query.id;

//   if (!videoId) {
//     return res.status(400).json({ error: "Missing video ID" });
//   }

//   const url = `https://www.youtube.com/watch?v=${videoId}`;

//   // 👇 Local aur Docker dono ke liye
//   const cookiesPath = fs.existsSync("/app/cookies.txt")
//     ? "/app/cookies.txt" // Docker/Railway
//     : "./cookies.txt"; // Local

//   console.log("🍪 Using cookies:", cookiesPath);

//   try {
//     const { stdout } = await execFileAsync("yt-dlp", [
//       "--dump-single-json",
//       "--no-playlist",
//       "--quiet",
//       "--no-warnings",
//       "--cookies",
//       cookiesPath, // ✅ auto path
//       "-f",
//       "bestaudio[ext=m4a]/bestaudio",
//       url,
//     ]);

//     const data = JSON.parse(stdout);

//     const audioFormat = data.formats
//       ?.filter((f) => f.acodec !== "none" && f.vcodec === "none")
//       ?.sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

//     const audioUrl = audioFormat?.url;

//     if (!audioUrl) {
//       return res.status(500).json({ error: "No audio found" });
//     }

//     const range = req.headers.range;

//     const requestHeaders = {
//       "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
//       Referer: "https://www.youtube.com/",
//     };

//     if (range) {
//       requestHeaders.Range = range;
//     }

//     https
//       .get(audioUrl, { headers: requestHeaders }, (stream) => {
//         const contentType = stream.headers["content-type"] || "audio/mp4";
//         const contentLength = stream.headers["content-length"];
//         const contentRange = stream.headers["content-range"];

//         res.setHeader("Content-Type", contentType);
//         res.setHeader("Access-Control-Allow-Origin", "*");
//         res.setHeader("Accept-Ranges", "bytes");
//         res.setHeader("Cache-Control", "no-cache");

//         if (contentLength) res.setHeader("Content-Length", contentLength);
//         if (contentRange) res.setHeader("Content-Range", contentRange);

//         const statusCode = range && contentRange ? 206 : 200;
//         res.writeHead(statusCode);

//         stream.pipe(res);

//         req.on("close", () => stream.destroy());
//       })
//       .on("error", (err) => {
//         console.error("❌ Stream error:", err.message);
//         if (!res.headersSent) res.status(500).json({ error: err.message });
//       });
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// import { execFile } from "child_process";
// import { promisify } from "util";
// import https from "https";
// import fs from "fs";

// const execFileAsync = promisify(execFile);

// export const Song_audio = async (req, res) => {
//   const videoId = req.query.id;

//   if (!videoId) {
//     return res.status(400).json({ error: "Missing video ID" });
//   }

//   const url = `https://www.youtube.com/watch?v=${videoId}`;

//   const cookiesPath = fs.existsSync("/app/cookies.txt")
//     ? "/app/cookies.txt"
//     : fs.existsSync("./cookies.txt")
//     ? "./cookies.txt"
//     : null;

//   try {
//     const args = [
//       "--dump-single-json",
//       "--no-playlist",
//       "--quiet",
//       "--no-warnings",
//       "-f",
//       "bestaudio/best",
//       url,
//     ];

//     if (cookiesPath) {
//       args.splice(4, 0, "--cookies", cookiesPath);
//     }

//     const { stdout } = await execFileAsync("yt-dlp", args);
//     const data = JSON.parse(stdout);

//     const audioFormat = data.formats
//       ?.filter((f) => f.acodec !== "none" && f.vcodec === "none")
//       ?.sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

//     if (!audioFormat?.url) {
//       return res.status(500).json({ error: "No audio found" });
//     }

//     const range = req.headers.range;

//     const headers = {
//       "User-Agent": "Mozilla/5.0",
//       Referer: "https://www.youtube.com/",
//     };

//     if (range) headers.Range = range;

//     https
//       .get(audioFormat.url, { headers }, (stream) => {
//         res.setHeader(
//           "Content-Type",
//           stream.headers["content-type"] || "audio/mpeg"
//         );
//         res.setHeader("Access-Control-Allow-Origin", "*");
//         res.setHeader("Accept-Ranges", "bytes");

//         if (stream.headers["content-length"]) {
//           res.setHeader("Content-Length", stream.headers["content-length"]);
//         }

//         if (stream.headers["content-range"]) {
//           res.setHeader("Content-Range", stream.headers["content-range"]);
//         }

//         res.writeHead(range && stream.headers["content-range"] ? 206 : 200);

//         stream.pipe(res);
//         req.on("close", () => stream.destroy());
//       })
//       .on("error", () => {
//         if (!res.headersSent) {
//           res.status(500).json({ error: "Stream error" });
//         }
//       });
//   } catch {
//     res.status(500).json({ error: "Failed to fetch audio" });
//   }
// };

import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import axios from "axios";

const execFileAsync = promisify(execFile);

export const Song_audio = async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).json({ error: "Missing video ID" });
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const cookiesPath = fs.existsSync("/app/cookies.txt")
    ? "/app/cookies.txt"
    : fs.existsSync("./cookies.txt")
      ? "./cookies.txt"
      : null;

  try {
    // 🔥 DIRECT AUDIO URL (MOST IMPORTANT FIX)
    const args = [
      "--no-cache-dir",
      "--no-check-certificates",
      "-f",
      "bestaudio",
      "-g",
      url,
    ];

    if (cookiesPath) {
      args.unshift("--cookies", cookiesPath);
    }

    const { stdout } = await execFileAsync("yt-dlp", args);

    const audioUrl = stdout.trim().split("\n")[0];

    if (!audioUrl) {
      return res.status(500).json({ error: "No audio URL found" });
    }

    const range = req.headers.range;

    const response = await axios({
      method: "GET",
      url: audioUrl,
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://www.youtube.com/",
        ...(range ? { Range: range } : {}),
      },
    });

    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "audio/mpeg",
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Accept-Ranges", "bytes");

    if (response.headers["content-length"]) {
      res.setHeader("Content-Length", response.headers["content-length"]);
    }

    if (response.headers["content-range"]) {
      res.setHeader("Content-Range", response.headers["content-range"]);
    }

    res.writeHead(range && response.headers["content-range"] ? 206 : 200);

    response.data.pipe(res);

    req.on("close", () => {
      response.data.destroy();
    });
  } catch (err) {
    console.log("❌ ERROR:", err.message);

    res.status(500).json({
      error: "Streaming failed",
    });
  }
};
