import YTMusic from "ytmusic-api";

export const Trending_song = async (req, res) => {
  try {
    const ytmusic = new YTMusic();
    await ytmusic.initialize();

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

    const results = await Promise.race([
      ytmusic.searchSongs(query),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 10000),
      ),
    ]);
    res.json(results);
  } catch (err) {
    console.error("ERROR:", err.message);

    res.status(500).json({
      error: "Failed",
      message: err.message,
    });
  }
};
