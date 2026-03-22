import YTMusic from "ytmusic-api";

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
export const Get_song_album = async (req, res) => {
  try {
    const { videoIds } = req.body;
    const ytmusic = new YTMusic();
    await ytmusic.initialize();
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({ message: "videoIds array is required" });
    }

    const results = await Promise.allSettled(
      videoIds.map(async (videoId) => {
        // Parallel mein sab fetch karo — fast hoga
        const [song, lyrics, relatedSongs] = await Promise.allSettled([
          ytmusic.getSong(videoId),
          ytmusic.getLyrics(videoId),
          ytmusic.getUpNexts(videoId),
        ]);

        const songData = song.status === "fulfilled" ? song.value : null;

        let album = null;
        const albumId = songData?.album?.id;
        if (albumId) {
          const albumResult = await ytmusic.getAlbum(albumId).catch(() => null);
          album = albumResult;
        }

        let artistDetails = [];
        if (songData?.artists?.length > 0) {
          const artistResults = await Promise.allSettled(
            songData.artists.map((a) =>
              a.id ? ytmusic.getArtist(a.id) : Promise.resolve(null),
            ),
          );
          artistDetails = artistResults.map((r, i) => ({
            id: songData.artists[i]?.id,
            name: songData.artists[i]?.name,
            details: r.status === "fulfilled" ? r.value : null,
          }));
        }

        return {
          videoId,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,

          // 🎵 Basic Song Info
          title: songData?.title,
          duration: songData?.duration,
          duration_seconds: songData?.duration_seconds,
          thumbnails: songData?.thumbnails,
          isExplicit: songData?.isExplicit || false,
          category: songData?.category || null,
          artists: artistDetails,
          album: album
            ? {
                id: album?.id,
                name: album?.name,
                year: album?.year,
                trackCount: album?.trackCount,
                description: album?.description,
                thumbnails: album?.thumbnails,
                tracks: album?.tracks || [],
              }
            : null,

          lyrics: lyrics.status === "fulfilled" ? lyrics.value : null,

          relatedSongs:
            relatedSongs.status === "fulfilled"
              ? relatedSongs.value?.map((s) => ({
                  videoId: s?.videoId,
                  title: s?.title,
                  artists: s?.artists,
                  thumbnails: s?.thumbnails,
                  duration: s?.duration,
                }))
              : [],
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
