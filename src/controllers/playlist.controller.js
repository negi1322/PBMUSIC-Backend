import { ReturnDocument } from "mongodb";
import YTMusic from "ytmusic-api";
import YoutubeMusicApi from "youtube-music-api";

export const Playlist_route = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: "Query is required" });
  }
  try {
    const ytmusic = new YTMusic();
    await ytmusic.initialize();
    const data = await ytmusic.search(query, "PLAYLIST");
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const Get_playlist = async (req, res) => {
  const { playlistId } = req?.body;
  console.log(playlistId);
  if (!playlistId) {
    return res.status(400).json({ message: "PlaylistId is required" });
  }
  try {
    const ytmusic = new YTMusic();
    await ytmusic.initialize();

    const playlist = await ytmusic?.getPlaylist(playlistId);

    console.log("get playlist is here", playlist);
    if (playlist) {
      return res
        .status(200)
        .json({ message: "playlist fetched", data: playlist });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err });
  }
};

export const Get_playlist_tracks = async (req, res) => {
  let { playlistId } = req?.body;

  if (!playlistId) {
    return res.status(400).json({ message: "PlaylistId is required" });
  }

  try {
    const api = new YoutubeMusicApi();
    await api.initalize();

    const playlist = await api.getPlaylist(playlistId);

    console.log("playlist++++++++", playlist);
    const songs = playlist?.content || [];

    if (songs.length > 0) {
      const tracks = songs.map((track) => ({
        videoId: track.videoId,
        title: track.name,
        artist: track.author?.[0]?.name || "Unknown",
        duration: track.duration,
        url: `https://www.youtube.com/watch?v=${track.videoId}`,
      }));

      return res.status(200).json({
        message: "Tracks fetched",
        totalTracks: tracks.length,
        tracks,
      });
    }

    return res.status(404).json({ message: "No tracks found" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

export const Get_song_album = async (req, res) => {
  try {
    const { videoIds } = req.body;

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({ message: "videoIds array is required" });
    }

    const ytmusic = new YTMusic();
    await ytmusic.initialize();

    const results = await Promise.allSettled(
      videoIds.map((videoId) => ytmusic.getSong(videoId)),
    );

    const songs = results.map((result, i) => ({
      videoId: videoIds[i],
      data: result.status === "fulfilled" ? result.value : null,
      error: result.status === "rejected" ? result.reason?.message : null,
    }));

    return res.status(200).json({ songs });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};
