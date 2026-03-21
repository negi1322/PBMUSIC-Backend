import mongoose from "mongoose";

const user_Favourite = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  videoIds: {
    type: [String],
    default: [],
  },
});

export default mongoose.model("favourite", user_Favourite);
