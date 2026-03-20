import userModel from "../models/user.js";

export const UserDetail = async (req, res) => {
  try {
    const { name, surname, contact, email } = req.body;
    const user = await userModel.findOneAndUpdate(
      { email },
      { $set: { name, surname, contact } },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("user is", user);
    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

export const User_profile = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await userModel.findOne({ email });
    const userData = {
      name: user?.name,
      email: user?.email,
      surname: user?.surname ?? null,
      contact: user?.contact ?? null,
      image: user?.image ?? null,
    };

    console.log(userData);
    res.status(200).json({ data: userData });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
