import axios from "axios";
import Demand from "../models/Demand.js";
// ✅ Create demand
export const createDemand = async (req, res) => {
  try {
    const { prestataireId, serviceId, message } = req.body;
    const clientId = req.user.id;

    if (!prestataireId || !serviceId) {
      return res.status(400).json({ msg: "prestataireId and serviceId are required" });
    }

    // ✅ Verify the prestataireId is a valid prestataire and get their user ID
    try {
      const prestataireRes = await axios.get(
        `${process.env.PRESTATAIRE_SERVICE_URL}/api/prestataires/${prestataireId}`
      );

      // Use the USER ID from the prestataire document
      const prestataireUserId = prestataireRes.data.user;

      const demand = await Demand.create({
        clientId,
        prestataireId: prestataireUserId, // ✅ Store USER ID, not prestataire doc ID
        serviceId,
        message,
      });

      res.status(201).json(demand);
    } catch (error) {
      return res.status(400).json({ msg: "Invalid prestataire ID" });
    }

  } catch (error) {
    console.error("CREATE DEMAND ERROR:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ✅ Get my demands
export const getMyDemands = async (req, res) => {
  try {
    // ✅ Use req.user.id from JWT instead of header
    const userId = req.user.id;

    const list = await Demand.find({
      $or: [{ clientId: userId }, { prestataireId: userId }],
    });

    res.json(list);
  } catch (error) {
    console.error("GET MY DEMANDS ERROR:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ✅ Update status

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ msg: "Status is required" });
    }

    const demand = await Demand.findById(req.params.id);
    
    if (!demand) {
      return res.status(404).json({ msg: "Demand not found" });
    }

    // ✅ Better error logging
    const prestataireUrl = `${process.env.PRESTATAIRE_SERVICE_URL}/api/prestataires/${demand.prestataireId}`;
    console.log("🔍 Fetching prestataire from:", prestataireUrl);

    try {
      const prestataireRes = await axios.get(prestataireUrl);

      console.log("✅ Prestataire response:", prestataireRes.data);

      const prestataireUserId = prestataireRes.data.user.toString();

      console.log("=" .repeat(50));
      console.log("🔍 Prestataire user ID:", prestataireUserId);
      console.log("🔍 Current user ID (from JWT):", req.user.id);
      console.log("🔍 Match?", prestataireUserId === req.user.id);
      console.log("=" .repeat(50));

      if (prestataireUserId !== req.user.id) {
        return res.status(403).json({ msg: "Not authorized to update this demand" });
      }

    } catch (error) {
      console.error("❌ Error fetching prestataire:");
      console.error("   URL:", prestataireUrl);
      console.error("   Status:", error.response?.status);
      console.error("   Data:", error.response?.data);
      console.error("   Message:", error.message);
      return res.status(500).json({ 
        msg: "Error verifying prestataire",
        debug: error.message 
      });
    }

    demand.status = status;
    await demand.save();

    res.json(demand);
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};