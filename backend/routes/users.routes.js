import express from "express";
import User from "../models/User.js";

const router = express.Router();

// UPDATE USER IMAGES
router.put("/:id/images", async (req, res) => {
  try {
    const { profileImage, certificateImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profileImage, certificateImage },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "Images updated", user });
  } catch (err) {
    console.error("UPDATE IMAGES ERROR 👉", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
