import userModel from "../models/user.js";
import bcrypt from "bcrypt";

export const Add_user = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const exist = await userModel.findOne({ email: trimmedEmail });
    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    const user = await userModel.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
