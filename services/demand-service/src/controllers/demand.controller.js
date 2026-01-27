import axios from "axios";
import Demand from "../models/Demand.js";
// ✅ Create demand
export const createDemand = async (req, res) => {
  try {
    const { prestataireId, serviceId, message } = req.body;
    const clientId = req.user.id;
    const userRole = req.user.role;

    console.log("📥 Creating demand");
    console.log("   User ID:", clientId);
    console.log("   User Role:", userRole);

    // ✅ Only clients can create demands
    if (userRole !== 'client') {
      return res.status(403).json({ 
        msg: "Only clients can create demands" 
      });
    }

    if (!prestataireId || !serviceId) {
      return res.status(400).json({ msg: "prestataireId and serviceId are required" });
    }

    const demand = await Demand.create({
      clientId,
      prestataireId,
      serviceId,
      message,
    });

    console.log("✅ Demand created:", demand._id);
    res.status(201).json(demand);

  } catch (error) {
    console.error("❌ CREATE DEMAND ERROR:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ✅ Get my demands
export const getMyDemands = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log("🔍 Get demands for user:", userId, "Role:", userRole);

    // ✅ Only allow clients and prestataires to see demands
    if (userRole !== 'client' && userRole !== 'prestataire') {
      return res.status(403).json({ 
        msg: "Only clients and prestataires can view demands" 
      });
    }

    const list = await Demand.find({
      $or: [{ clientId: userId }, { prestataireId: userId }],
    });

    console.log(`✅ Found ${list.length} demands for user`);
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
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log("📥 Update status request");
    console.log("   User ID:", userId);
    console.log("   User Role:", userRole);

    // ✅ Only prestataires can update status
    if (userRole !== 'prestataire') {
      return res.status(403).json({ 
        msg: "Only prestataires can update demand status" 
      });
    }

    if (!status) {
      return res.status(400).json({ msg: "Status is required" });
    }

    const demand = await Demand.findById(req.params.id);
    
    if (!demand) {
      return res.status(404).json({ msg: "Demand not found" });
    }

    // ✅ Verify this prestataire owns this demand
    if (process.env.PRESTATAIRE_SERVICE_URL) {
      try {
        const prestataireRes = await axios.get(
          `${process.env.PRESTATAIRE_SERVICE_URL}/api/prestataires/${demand.prestataireId}`
        );

        const prestataireUserId = prestataireRes.data.user.toString();

        if (prestataireUserId !== userId) {
          return res.status(403).json({ msg: "Not authorized to update this demand" });
        }

      } catch (error) {
        console.warn("⚠️ Prestataire verification failed, checking direct ID");
        
        // Fallback: check if demand.prestataireId matches user ID
        if (demand.prestataireId.toString() !== userId) {
          return res.status(403).json({ msg: "Not authorized to update this demand" });
        }
      }
    } else {
      // No prestataire service, check directly
      if (demand.prestataireId.toString() !== userId) {
        return res.status(403).json({ msg: "Not authorized to update this demand" });
      }
    }

    demand.status = status;
    await demand.save();

    console.log("✅ Status updated to:", status);
    res.json(demand);

  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};