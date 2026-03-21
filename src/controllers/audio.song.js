import ytdlp from "yt-dlp-exec";
import https from "https";

export const Song_audio = async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) return res.status(400).json({ error: "Missing video ID" });

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // 👇 Step 1 — audio URL + filesize ek saath lo
    const data = await ytdlp(url, {
      dumpSingleJson: true,
      format: "bestaudio",
    });

    const audioFormat = data.formats
      ?.filter((f) => f.acodec !== "none" && f.vcodec === "none")
      ?.sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

    const audioUrl = audioFormat?.url;
    const fileSize = audioFormat?.filesize || audioFormat?.filesize_approx;

    if (!audioUrl) return res.status(500).json({ error: "No audio found" });

    const range = req.headers.range;

    // 👇 Step 2 — Range header handle karo
    const requestHeaders = {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://www.youtube.com/",
    };

    if (range) {
      requestHeaders.Range = range; // 👈 seeking request forward karo
    }

    // 👇 Step 3 — proxy karo YouTube stream
    https
      .get(audioUrl, { headers: requestHeaders }, (stream) => {
        const statusCode = stream.statusCode; // 200 ya 206

        const responseHeaders = {
          ...stream.headers,
          "Access-Control-Allow-Origin": "*",
          "Accept-Ranges": "bytes",
        };

        // 👇 filesize manually add karo agar YouTube ne nahi diya
        if (!responseHeaders["content-length"] && fileSize) {
          responseHeaders["Content-Length"] = fileSize;
        }

        // 👇 Range request hai toh Content-Range add karo
        if (range && fileSize) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunkSize = end - start + 1;

          responseHeaders["Content-Range"] =
            `bytes ${start}-${end}/${fileSize}`;
          responseHeaders["Content-Length"] = chunkSize;

          res.writeHead(206, responseHeaders); // 👈 206 = Partial Content
        } else {
          res.writeHead(statusCode, responseHeaders);
        }

        stream.pipe(res);

        // 👇 client disconnect pe stream band karo
        req.on("close", () => stream.destroy());
      })
      .on("error", (err) => {
        console.error("❌ Stream error:", err.message);
        if (!res.headersSent) res.status(500).json({ error: err.message });
      });
  } catch (err) {
    console.error("❌ yt-dlp error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
