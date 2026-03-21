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

// export const Get_song_album = async (req, res) => {
//   try {
//     const { videoIds } = req.body;
//     if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
//       return res.status(400).json({ message: "videoIds array is required" });
//     }

//     const results = await Promise.allSettled(
//       videoIds.map(async (videoId) => {
//         const song = await ytmusic.getSong(videoId);
//         const albumId = song?.album?.id;
//         if (!albumId) return { videoId, album: null };
//         const album = await ytmusic.getAlbum(albumId);
//         return { videoId, album };
//       }),
//     );

//     const albums = results.map((result, i) => ({
//       videoId: videoIds[i],
//       album: result.status === "fulfilled" ? result.value.album : null,
//       error: result.status === "rejected" ? result.reason?.message : null,
//     }));

//     return res.status(200).json({ albums });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Something went wrong", error: err.message });
//   }
// };

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
        let album = null;

        if (albumId) {
          album = await ytmusic.getAlbum(albumId);
        }

        return {
          videoId,

          // 🎵 Basic Info
          title: song?.title,
          duration: song?.duration, // string (e.g. "3:45")
          duration_seconds: song?.duration_seconds,

          // 👤 Artists
          artists: song?.artists?.map((a) => ({
            name: a.name,
            id: a.id,
          })),

          // 💿 Album
          album: album
            ? {
                name: album?.name,
                id: album?.id,
                year: album?.year,
                thumbnails: album?.thumbnails,
              }
            : null,

          // 🖼️ Thumbnail
          thumbnails: song?.thumbnails,

          // 🔗 Video URL
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        };
      }),
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
