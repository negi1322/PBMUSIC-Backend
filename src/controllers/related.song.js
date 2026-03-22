import YTMusic from "ytmusic-api";

export const Related_song = async (req, res) => {
  try {
    const { videoId } = req.body;
    const ytmusic = new YTMusic();
    await ytmusic.initialize();
    if (!videoId) {
      return res.status(400).json({ message: "videoId is required" });
    }
    const relatedSongs = await ytmusic.getUpNexts(videoId);

    if (!relatedSongs || relatedSongs.length === 0) {
      return res.status(404).json({ message: "No related songs found" });
    }
    return res.status(200).json({
      videoId,
      relatedSongs,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};
