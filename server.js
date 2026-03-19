import express from "express";
import cors from "cors";
import ytdlp from "yt-dlp-exec";
import https from "https";
import YTMusic from "ytmusic-api";
import process from "process";
const API = process.env.APP_URL;

console.log(API);
const app = express();
const ytmusic = new YTMusic();

(async () => {
  await ytmusic.initialize();
})();

const allowedOrigins = ["http://localhost:5173", "http://10.96.80.138:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);
app.use(express.json());

app.post("/search", async (req, res) => {
  const { songname } = req.body;
  try {
    const results = await ytmusic.searchSongs(songname);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

app.get("/audio", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) return res.status(400).json({ error: "Missing video ID" });
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const data = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      preferFreeFormats: true,
      format: "bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio",
    });

    const audioFormat = data.formats
      ?.filter((f) => f.acodec !== "none" && f.vcodec === "none")
      ?.sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

    const audioUrl = audioFormat?.url || data.url;
    if (!audioUrl) return res.status(500).json({ error: "No audio found" });

    const ext = audioFormat?.ext || "webm";
    res.setHeader("Content-Type", ext === "m4a" ? "audio/mp4" : "audio/webm");
    res.setHeader("Access-Control-Allow-Origin", "*");

    https.get(
      audioUrl,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          Referer: "https://www.youtube.com/",
          Origin: "https://www.youtube.com",
        },
      },
      (stream) => {
        stream.pipe(res);

        stream.on("error", (err) => {});
      },
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/trending", async (req, res) => {
  const { category } = req.query;
  const categoryMap = {
    all: "trending hindi 2025",
    podcasts: "best podcasts 2025",
    romance: "romantic hindi songs 2025",
    relax: "relaxing lofi songs",
    party: "party hits 2025",
    workout: "workout motivation songs",
    focus: "focus study music",
    sleep: "sleep music calm",
  };
  const query = categoryMap[category] || categoryMap["all"];
  try {
    const results = await ytmusic.searchSongs(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

app.get("/playlist", async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(401).json({ message: "quey required" });
  }
  try {
    const data = await ytmusic.search(query);
    console.log("data is", data);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "server error", error });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
