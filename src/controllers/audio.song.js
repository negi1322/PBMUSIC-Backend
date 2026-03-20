import YTMusic from "ytmusic-api";
import ytdlp from "yt-dlp-exec";
import https from "https";
const ytmusic = new YTMusic();
await ytmusic.initialize();

export const Song_audio = async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).json({ error: "Missing video ID" });
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const data = await ytdlp(url, {
      dumpSingleJson: true,
      format: "bestaudio",
    });

    const audioFormat = data.formats
      ?.filter((f) => f.acodec !== "none" && f.vcodec === "none")
      ?.sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

    const audioUrl = audioFormat?.url;

    if (!audioUrl) {
      return res.status(500).json({ error: "No audio found" });
    }

    const range = req.headers.range;
    const headers = {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://www.youtube.com/",
    };

    if (range) {
      headers.Range = range;
    }

    https.get(audioUrl, { headers }, (stream) => {
      res.writeHead(stream.statusCode, {
        ...stream.headers,
        "Access-Control-Allow-Origin": "*",
        "Accept-Ranges": "bytes",
      });
      stream.pipe(res);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
