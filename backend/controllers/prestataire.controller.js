import Prestataire from "../models/Prestataire.js";

/**
 * CREATE PRESTATAIRE
 */
export const createPrestataire = async (req, res) => {
  try {
    const {
      service,
      category, 
      experience,
      city,
      phone,
      profileImage,
      certificateImage,
    } = req.body;

    if (
      !service ||
      !category || 
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
      category, 
      experience,
      city,
      phone,
      profileImage,
      certificateImage,
      availability: true,
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
    const filter = { isVerified: { $in: [true, false] } };


    // 🔥 filter by service
    if (req.query.service) {
      filter.service = req.query.service;
    }

    const list = await Prestataire.find(filter)
      .populate("user", "name email")
      .populate({
        path: "service",
        populate: {
          path: "category",
          select: "name icon",
        },
      });

    res.json(list);
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
      { isVerified: { $in: [true, false]}},
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
