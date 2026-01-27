import axios from "axios";
import mongoose from "mongoose";
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
      profileImage,
      certificateImage,
    } = req.body;

    console.log("📥 Creating prestataire");
    console.log("   User ID:", req.user.id);
    console.log("   Service ID:", service);
    console.log("   Category ID:", category);

    if (!service || !category || !experience || !city) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Check if already exists
    const exists = await Prestataire.findOne({ user: req.user.id });
    if (exists) {
      console.log("❌ Prestataire already exists");
      return res.status(400).json({ msg: "Prestataire already exists" });
    }

    // Optional catalog validation
    if (process.env.CATALOG_SERVICE_URL) {
      const catalogUrl = `${process.env.CATALOG_SERVICE_URL}/api/services/${service}`;
      console.log("🔍 Validating with catalog:", catalogUrl);

      try {
        const serviceRes = await axios.get(catalogUrl);

        if (serviceRes.data.category._id.toString() !== category.toString()) {
          return res.status(400).json({ msg: "Service does not belong to category" });
        }

        console.log("✅ Catalog validation passed");

      } catch (catalogError) {
        console.warn("⚠️ Catalog validation failed, continuing anyway");
        console.warn("   Error:", catalogError.message);
        // Don't block - just log the warning
      }
    } else {
      console.log("⚠️ No catalog URL configured, skipping validation");
    }

    // Create prestataire
    const prestataire = await Prestataire.create({
      user: req.user.id,
      service,
      category,
      experience,
      city,
      profileImage,
      certificateImage,
    });

    console.log("✅ Prestataire created:", prestataire._id);
    res.status(201).json(prestataire);

  } catch (error) {
    console.error("❌ CREATE PRESTATAIRE ERROR:", error.message);
    res.status(500).json({ msg: "Server error", details: error.message });
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
 * GET PRESTATAIRE BY ID
 */
export const getPrestataireById = async (req, res) => {
  try {
    const prestataire = await Prestataire.findById(req.params.id);
    
    if (!prestataire) {
      return res.status(404).json({ msg: "Prestataire not found" });
    }
    
    res.json(prestataire);
  } catch (error) {
    console.error("GET PRESTATAIRE BY ID ERROR:", error.message);
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