import userModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const Login_user = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    const existUser = await userModel.findOne({ email });
    if (!existUser) {
      return res.status(400).json({ message: "User not found" });
    }
    const checkPassword = await bcrypt.compare(password, existUser?.password);
    let token = null;
    if (checkPassword) {
      token = jwt.sign(
        { id: existUser?._id, email: existUser?.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );
    } else {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    res.status(201).json({
      message: "User SignIn successfully",
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
