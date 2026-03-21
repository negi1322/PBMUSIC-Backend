import YTMusic from "ytmusic-api";

const ytmusic = new YTMusic();
await ytmusic.initialize();

export const Playlist_route = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: "Query is required" });
  }
  try {
    const data = await ytmusic.search(query, "PLAYLIST");
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const Get_song_album = async (req, res) => {
  try {
    const { videoIds } = req.body;
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({ message: "videoIds array is required" });
    }

    const results = await Promise.allSettled(
      videoIds.map(async (videoId) => {
        const song = await ytmusic.getSong(videoId);
        const albumId = song?.album?.id;
        if (!albumId) return { videoId, album: null };
        const album = await ytmusic.getAlbum(albumId);
        return { videoId, album };
      }),
    );

    const albums = results.map((result, i) => ({
      videoId: videoIds[i],
      album: result.status === "fulfilled" ? result.value.album : null,
      error: result.status === "rejected" ? result.reason?.message : null,
    }));

    return res.status(200).json({ albums });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};
