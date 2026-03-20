import YTMusic from "ytmusic-api";

const ytmusic = new YTMusic();
await ytmusic.initialize();

export const Search_song = async (req, res) => {
  const { songname } = req.body;
  try {
    const results = await ytmusic.searchSongs(songname);
    const filteredSerchSongs = results?.filter((i) => i?.videoId);
    res.json(filteredSerchSongs);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
};
