// import { execFile } from "child_process";
// import { promisify } from "util";
// import fs from "fs";
// import axios from "axios";

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
//       ? "./cookies.txt"
//       : null;

//   try {
//     const args = [
//       "--no-cache-dir",
//       "--no-check-certificates",
//       "--js-runtimes",
//       "node",
//       "--remote-components",
//       "ejs:github",
//       "-f",
//       "bestaudio[ext=m4a]/bestaudio",
//       "-g",
//       url,
//     ];

//     if (cookiesPath) {
//       args.unshift("--cookies", cookiesPath);
//     }

//     const { stdout } = await execFileAsync("yt-dlp", args);
//     const audioUrl = stdout.trim().split("\n")[0];
//     if (!audioUrl) {
//       return res.status(500).json({ error: "No audio URL found" });
//     }

//     const range = req.headers.range;

//     const response = await axios({
//       method: "GET",
//       url: audioUrl,
//       responseType: "stream",
//       headers: {
//         "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
//         Referer: "https://www.youtube.com/",
//         ...(range ? { Range: range } : {}),
//       },
//     });

//     res.setHeader(
//       "Content-Type",
//       response.headers["content-type"] || "audio/mp4",
//     );
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Accept-Ranges", "bytes");
//     res.setHeader("Cache-Control", "no-cache");

//     if (response.headers["content-length"]) {
//       res.setHeader("Content-Length", response.headers["content-length"]);
//     }

//     if (response.headers["content-range"]) {
//       res.setHeader("Content-Range", response.headers["content-range"]);
//     }

//     const statusCode = range && response.headers["content-range"] ? 206 : 200;
//     res.writeHead(statusCode);

//     response.data.pipe(res);

//     req.on("close", () => response.data.destroy());
//   } catch (err) {
//     console.error("❌ ERROR:", err.message);
//     if (!res.headersSent) {
//       res.status(500).json({ error: "Streaming failed", detail: err.message });
//     }
//   }
// };



import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import axios from "axios";

const execFileAsync = promisify(execFile);

// ✅ Use correct yt-dlp path based on environment
const ytDlpPath = process.env.YTDLP_PATH || "yt-dlp";

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
    const args = [
      "--no-cache-dir",
      "--no-check-certificates",
      "-f",
      "bestaudio[ext=m4a]/bestaudio",
      "-g",
      url,
    ];

    if (cookiesPath) {
      args.unshift("--cookies", cookiesPath);
    }

    // ✅ Use ytDlpPath instead of hardcoded "yt-dlp"
    const { stdout } = await execFileAsync(ytDlpPath, args);
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
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
        Referer: "https://www.youtube.com/",
        ...(range ? { Range: range } : {}),
      },
    });

    res.setHeader("Content-Type", response.headers["content-type"] || "audio/mp4");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "no-cache");

    if (response.headers["content-length"]) {
      res.setHeader("Content-Length", response.headers["content-length"]);
    }
    if (response.headers["content-range"]) {
      res.setHeader("Content-Range", response.headers["content-range"]);
    }

    const statusCode = range && response.headers["content-range"] ? 206 : 200;
    res.writeHead(statusCode);

    response.data.pipe(res);
    req.on("close", () => response.data.destroy());

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Streaming failed", detail: err.message });
    }
  }
};