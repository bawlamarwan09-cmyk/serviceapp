import Prestataire from "../models/Prestataire.js";

/**
 * CREATE PRESTATAIRE
 */
export const createPrestataire = async (req, res) => {
  try {
    const {
      service,
      experience,
      city,
      phone,
      profileImage,
      certificateImage,
    } = req.body;

    if (
      !service ||
      !experience ||
      !city ||
      !phone ||
      !profileImage ||
      !certificateImage
    ) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const exists = await Prestataire.findOne({ user: req.user.id });
    if (exists) {
      return res.status(400).json({ msg: "Prestataire already exists" });
    }

    const prestataire = await Prestataire.create({
      user: req.user.id,
      service,
      experience,
      city,
      phone,
      profileImage,
      certificateImage,
      availability: true,
      isVerified: false,
    });

    res.status(201).json(prestataire);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET ALL VERIFIED PRESTATAIRES
 */
export const getPrestataires = async (req, res) => {
  try {
    const list = await Prestataire.find({ isVerified: true })
      .populate("user", "name email")
      .populate("service", "name");

    res.json(list);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET MY PRESTATAIRE (logged user)
 */
export const getMyPrestataire = async (req, res) => {
  try {
    const prestataire = await Prestataire.findOne({
      user: req.user.id,
    }).populate("service", "name");

    if (!prestataire) {
      return res.status(404).json({ msg: "Prestataire not found" });
    }

    res.json(prestataire);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * ADMIN VERIFY PRESTATAIRE
 */
export const verifyPrestataire = async (req, res) => {
  try {
    const prestataire = await Prestataire.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!prestataire) {
      return res.status(404).json({ msg: "Prestataire not found" });
    }

    res.json(prestataire);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
