import { execFile } from "child_process";
import { promisify } from "util";
import https from "https";

const execFileAsync = promisify(execFile);

export const Song_audio = async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) return res.status(400).json({ error: "Missing video ID" });

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const { stdout } = await execFileAsync("yt-dlp", [
      "--dump-single-json",
      "--no-playlist",
      "--quiet",
      "-f",
      "bestaudio",
      url,
    ]);

    const data = JSON.parse(stdout);

    const audioFormat = data.formats
      ?.filter((f) => f.acodec !== "none" && f.vcodec === "none")
      ?.sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

    const audioUrl = audioFormat?.url;
    const fileSize = audioFormat?.filesize || audioFormat?.filesize_approx;

    if (!audioUrl) return res.status(500).json({ error: "No audio found" });

    const range = req.headers.range;

    const requestHeaders = {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://www.youtube.com/",
    };

    if (range) requestHeaders.Range = range;

    https
      .get(audioUrl, { headers: requestHeaders }, (stream) => {
        const responseHeaders = {
          ...stream.headers,
          "Access-Control-Allow-Origin": "*",
          "Accept-Ranges": "bytes",
        };

        if (!responseHeaders["content-length"] && fileSize) {
          responseHeaders["Content-Length"] = fileSize;
        }

        if (range && fileSize) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunkSize = end - start + 1;

          responseHeaders["Content-Range"] =
            `bytes ${start}-${end}/${fileSize}`;
          responseHeaders["Content-Length"] = chunkSize;

          res.writeHead(206, responseHeaders);
        } else {
          res.writeHead(stream.statusCode, responseHeaders);
        }

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
