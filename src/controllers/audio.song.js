import { spawn } from "child_process";

export const Song_audio = async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) return res.status(400).json({ error: "Missing video ID" });

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  console.log("▶️ Playing:", url);

  // 👇 Step 1 — pehle total size nikalo
  const sizeProcess = spawn("yt-dlp", [
    "-f",
    "bestaudio",
    "--no-playlist",
    "--quiet",
    "--print",
    "%(filesize,filesize_approx)s", // 👈 size fetch karo
    url,
  ]);

  let fileSize = null;

  sizeProcess.stdout.on("data", (d) => {
    const size = parseInt(d.toString().trim());
    if (!isNaN(size)) fileSize = size;
  });

  sizeProcess.on("close", () => {
    const range = req.headers.range;

    let start = 0;
    let end = fileSize ? fileSize - 1 : null;

    // 👇 Step 2 — Range header handle karo (seeking ke liye)
    if (range && fileSize) {
      const parts = range.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        // 👈 206 = Partial Content (seeking support)
        "Content-Type": "audio/webm",
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Access-Control-Allow-Origin": "*",
      });
    } else {
      res.writeHead(200, {
        "Content-Type": "audio/webm",
        "Accept-Ranges": "bytes",
        ...(fileSize && { "Content-Length": fileSize }), // 👈 size pata ho toh add karo
        "Access-Control-Allow-Origin": "*",
        "Transfer-Encoding": fileSize ? undefined : "chunked",
      });
    }

    // 👇 Step 3 — actual stream karo
    const ytdlp = spawn("yt-dlp", [
      "-f",
      "bestaudio",
      "--no-playlist",
      "--quiet",
      "--no-warnings",
      "-o",
      "-",
      url,
    ]);

    ytdlp.stdout.pipe(res);

    ytdlp.stderr.on("data", (d) => console.error("yt-dlp:", d.toString()));

    ytdlp.on("error", (err) => {
      console.error("❌ spawn error:", err.message);
      if (!res.headersSent) res.status(500).json({ error: err.message });
    });

    ytdlp.on("close", (code) => console.log("yt-dlp closed:", code));

    req.on("close", () => ytdlp.kill("SIGTERM"));
  });
};
