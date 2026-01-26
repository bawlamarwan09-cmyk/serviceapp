import axios from "axios";
import mongoose from "mongoose";
import Prestataire from "../models/Prestataire.js";
const CATALOG_URL = process.env.CATALOG_SERVICE_URL;

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
      profileImage,
      certificateImage,
    } = req.body;
    console.log("CATALOG_URL =", process.env.CATALOG_SERVICE_URL);
    console.log("SERVICE ID =", service);
    if (
      !service ||
      !category ||
      !experience ||
      !city 
    ) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // check if already exists
    const exists = await Prestataire.findOne({ user: req.user.id });
    if (exists) {
      return res.status(400).json({ msg: "Prestataire already exists" });
    }

    // 🔥 verify service belongs to category (Catalog Service)
    const serviceRes = await axios.get(
  `http://localhost:3000/api/services/${service}`
);


    if (serviceRes.data.category._id.toString() !== category.toString()) {
  return res
    .status(400)
    .json({ msg: "Service does not belong to category" });
}


    const prestataire = await Prestataire.create({
      user: req.user.id,
      service,
      category,
      experience,
      city,
      profileImage,
      certificateImage,
    });

    res.status(201).json(prestataire);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
  

};

/**
 * GET PRESTATAIRES
 */
export const getPrestataires = async (req, res) => {
  try {
    const filter = {};

    
if (req.query.service) {
  filter.service = new mongoose.Types.ObjectId(req.query.service);
}
if (req.query.category) {
  filter.category = new mongoose.Types.ObjectId(req.query.category);
}

    const list = await Prestataire.find(filter).sort({ createdAt: -1 });

    res.json(list);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * ADMIN VERIFY
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
export const getPrestataireById = async (req, res) => {
  try {
    const prestataire = await Prestataire.findById(req.params.id);
    
    if (!prestataire) {
      return res.status(404).json({ msg: "Prestataire not found" });
    }
    
    res.json(prestataire);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};