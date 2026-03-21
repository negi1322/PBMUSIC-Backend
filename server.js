import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import { Playlist_route } from "./src/controllers/playlist.controller.js";
import { Search_song } from "./src/controllers/search.song.js";
import { Trending_song } from "./src/controllers/tranding.song.js";
import { Song_audio } from "./src/controllers/audio.song.js";
import { Add_user } from "./src/controllers/adduser.song.js";
import { Login_user } from "./src/controllers/login.song.js";
import { UserDetail, User_profile } from "./src/controllers/userDetail.song.js";

const app = express();
app.use(express.json());

connectDB();
const Port = process.env.PORT;
const allowedOrigins = [
  "http://localhost:5173",
  "http://10.96.80.138:5173",
  process.env.FRONTEND_URL,
  "https://pb-music-eight.vercel.app/login",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

// Routes
app.post("/addUser", Add_user);
app.post("/search", Search_song);
app.get("/audio", Song_audio);
app.get("/trending", Trending_song);
app.get("/playlist", Playlist_route);
app.post("/login", Login_user);
app.put("/update_profile", UserDetail);
app.get("/profile", User_profile);

app.listen(Port, () => {
  console.log(`🚀 Server running at ${Port}`);
});
