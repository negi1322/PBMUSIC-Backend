import YTMusic from "ytmusic-api";
const ytmusic = new YTMusic();
await ytmusic.initialize();

export const Trending_song = async (req, res) => {
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
};
