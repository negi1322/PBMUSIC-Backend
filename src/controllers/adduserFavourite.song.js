import userFavModel from "../models/favourite.js";
import userModel from "../models/user.js";

export const Add_user_fav = async (req, res) => {
  try {
    const { email, videoId } = req.body;
    if (!email || !videoId) {
      return res
        .status(400)
        .json({ message: "Email and videoId are required" });
    }

    const check = await userModel.findOne({ email });
    if (!check) {
      return res.status(400).json({ message: "User not found" });
    }
    const addingFav = await userFavModel.findOneAndUpdate(
      { email },
      { $addToSet: { videoIds: videoId } },
      { upsert: true, new: true },
    );

    if (addingFav) {
      return res
        .status(201)
        .json({ message: "Song added successfully", data: addingFav });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

export const Get_favourite_song = async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: "Email  are required" });
  }
  try {
    const confirmUser = await userModel.findOne({ email });
    if (!confirmUser) {
      return res.status(400).json({ message: "User not found" });
    }
    const userFavourites = await userFavModel?.findOne({ email });
    if (userFavourites) {
      return res
        .status(200)
        .json({ message: "Song fetch successfully", data: userFavourites });
    } else {
      return res.status(200).json({ message: "No songs added" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

export const Remove_user_fav = async (req, res) => {
  try {
    const { email, videoId } = req.body;
    if (!email || !videoId) {
      return res
        .status(400)
        .json({ message: "Email and videoId are required" });
    }

    const check = await userModel.findOne({ email });
    if (!check) {
      return res.status(400).json({ message: "User not found" });
    }
    const RemovingFav = await userFavModel.findOneAndUpdate(
      { email },
      { $pull: { videoIds: videoId } },
      { new: true },
    );

    if (RemovingFav) {
      return res
        .status(201)
        .json({ message: "Song remove successfully", data: RemovingFav });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};
