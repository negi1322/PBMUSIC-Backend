import YTMusic from "ytmusic-api";

export const Search_song = async (req, res) => {
  const { songname } = req.body;
  try {
    const ytmusic = new YTMusic();
    await ytmusic.initialize();
    const results = await ytmusic.searchSongs(songname);
    const filteredSerchSongs = results?.filter((i) => i?.videoId);
    res.json(filteredSerchSongs);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
};
