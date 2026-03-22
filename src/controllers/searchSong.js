import YTMusic from "ytmusic-api";

const ytmusic = new YTMusic();
await ytmusic.initialize();

export const Search_suggestions = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Search Something" });
  }

  try {
    const result = await ytmusic.getSearchSuggestions(query);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No suggestions found" });
    }

    return res.status(200).json({
      query,
      totalResults: result.length,
      suggestions: result,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};
