import axios from "axios";
import Service from "../models/Service.js";

const PRESTATAIRE_SERVICE_URL = process.env.PRESTATAIRE_SERVICE_URL;

export const createService = async (req, res) => {
  try {
    const { name, category, description, price, icon } = req.body;

    const service = await Service.create({
      name,
      category,
      description,
      price,
      icon,
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getServices = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const services = await Service.find(filter).populate(
      "category",
      "name icon"
    );

    res.json(services);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "category",
      "name icon"
    );

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// 🔥 NEW AGGREGATION ENDPOINT
export const getServiceWithPrestataires = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate service ID
    if (!id) {
      return res.status(400).json({ msg: "Service ID is required" });
    }

    // 2️⃣ Get service
    const service = await Service.findById(id).populate(
      "category",
      "name icon"
    );

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    // 3️⃣ Get prestataires by service
    let prestataires = [];
    try {
      const prestatairesRes = await axios.get(
        `${process.env.PRESTATAIRE_SERVICE_URL}/prestataires/by-service/${service._id}`
      );

      // 4️⃣ Normalize data (handle old records)
      prestataires = prestatairesRes.data.map((p) => ({
        _id: p._id,
         user: typeof p.user === "object" ? p.user._id : p.user,
        name: p.name || "Prestataire", // ✅ fallback for old data
        city: p.city,
        experience: p.experience,
        availability: p.availability,
        isVerified: p.isVerified,
      }));
    } catch (prestataireError) {
      console.error(
        "PRESTATAIRE SERVICE ERROR:",
        prestataireError.response?.data || prestataireError.message
      );
    }

    // 5️⃣ Final response
    res.json({
      service,
      prestataires,
    });
  } catch (error) {
    console.error(
      "GET SERVICE WITH PRESTATAIRES ERROR:",
      error.message
    );
    res.status(500).json({ msg: "Server error" });
  }
};
