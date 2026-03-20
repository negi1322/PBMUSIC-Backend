import mongoose from "mongoose";

const User_model = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", User_model);
