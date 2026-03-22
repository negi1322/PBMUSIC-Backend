import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import {
  Get_playlist,
  Get_playlist_tracks,
  Get_song_album,
  Playlist_route,
} from "./src/controllers/playlist.controller.js";
import { Search_song } from "./src/controllers/search.song.js";
import { Trending_song } from "./src/controllers/tranding.song.js";
import { Song_audio } from "./src/controllers/audio.song.js";
import { Add_user } from "./src/controllers/adduser.song.js";
import { Login_user } from "./src/controllers/login.song.js";
import { UserDetail, User_profile } from "./src/controllers/userDetail.song.js";
import {
  Add_user_fav,
  Get_favourite_song,
  Remove_user_fav,
} from "./src/controllers/adduserFavourite.song.js";
import { Related_song } from "./src/controllers/related.song.js";
import { Search_suggestions } from "./src/controllers/searchSong.js";

const app = express();
app.use(express.json());

connectDB();
const Port = process.env.PORT;
const allowedOrigins = [
  "http://localhost:5173",
  "http://10.96.80.138:5173",
  "http://192.168.1.65:5173",
  "https://pb-music-eight.vercel.app",
  "https://pb-music-q1jx.vercel.app",
  process.env.FRONTEND_URL,
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
app.get("/", (req, res) => {
  res.send("hyy welcome to developer world");
});
app.post("/addUser", Add_user);
app.post("/search", Search_song);
app.get("/audio", Song_audio);
app.get("/trending", Trending_song);
app.get("/playlist", Playlist_route);
app.post("/login", Login_user);
app.put("/update_profile", UserDetail);
app.get("/profile", User_profile);
app.post("/addFav", Add_user_fav);
app.post("/removeFav", Remove_user_fav);
app.get("/getFav", Get_favourite_song);
app.post("/get_song", Get_song_album);
app.post("/related_song", Related_song);
app.get("/search_song", Search_suggestions);
app.post("/get_playlist", Get_playlist);
app.post("/get_playlist_track", Get_playlist_tracks);
app.listen(Port, () => {
  console.log(`🚀 Server running at ${Port}`);
});
