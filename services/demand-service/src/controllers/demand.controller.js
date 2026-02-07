import axios from "axios";
import Demand from "../models/Demand.js";

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

    res.status(201).json(demand);

  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const getMyDemands = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "client" && userRole !== "prestataire") {
      return res.status(403).json({
        msg: "Only clients and prestataires can view demands",
      });
    }

    const list = await Demand.find({
  $or: [{ clientId: userId }, { prestataireId: userId }],
})
.populate("clientId", "name phone")
.populate("prestataireId", "name");

    res.json(list);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

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

    // Verify this prestataire owns this demand
    if (demand.prestataireId.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized to update this demand" });
    }

    demand.status = status;
    await demand.save();

    if (status === "accepted" && process.env.MESSAGE_SERVICE_URL) {
      try {
        await axios.post(
          `${process.env.MESSAGE_SERVICE_URL}/api/messages/init-conversation`,
          {
            demandId: demand._id.toString(),
            clientId: demand.clientId.toString(),
            prestataireId: demand.prestataireId.toString(),
            initialMessage: `Hello! I have accepted your request for: ${demand.message}`
          },
          {
            headers: {
              Authorization: req.headers.authorization
            }
          }
        );

      } catch (error) {
        console.error("Failed to create conversation:", error.message);
        // Don't fail the status update if message creation fails
      }
    }

    res.json(demand);

  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const setMeetingLocation = async (req, res) => {
  try {
    const { latitude, longitude, address, appointmentDate } = req.body;
    const userId = req.user.id;
    const demandId = req.params.id;

    if (!latitude || !longitude) {
      return res.status(400).json({ msg: "Latitude and longitude are required" });
    }

    // Get demand
    const demand = await Demand.findById(demandId);
    
    if (!demand) {
      return res.status(404).json({ msg: "Demand not found" });
    }

    if (demand.prestataireId.toString() !== userId) {
      return res.status(403).json({ msg: "Only prestataire can set meeting location" });
    }

    // Update location
    demand.location = {
      type: 'Point',
      coordinates: [longitude, latitude], // MongoDB uses [lng, lat]
      address: address || "Location set by prestataire",
      confirmedBy: 'prestataire',
      confirmedAt: new Date(),
    };

    if (appointmentDate) {
      demand.appointmentDate = new Date(appointmentDate);
    }

    await demand.save();

    res.json(demand);

  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const confirmMeetingLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const demandId = req.params.id;

    const demand = await Demand.findById(demandId);
    
    if (!demand) {
      return res.status(404).json({ msg: "Demand not found" });
    }

    if (demand.clientId.toString() !== userId) {
      return res.status(403).json({ msg: "Only client can confirm meeting location" });
    }

    // Check if location is set
    if (!demand.location || !demand.location.coordinates) {
      return res.status(400).json({ msg: "No location to confirm" });
    }

    demand.location.confirmedBy = 'both';
    await demand.save();

    res.json(demand);

  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const getDemandesByPrestataire = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    const demandes = await Demande.find({
      prestataire: req.params.id,
    }).populate("client", "name phone");

    res.json(demandes);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
}
export const getDemandById = async (req, res) => {
  try {
    const demandId = req.params.id;
    
    const demand = await Demand.findById(demandId);
    
    if (!demand) {
      return res.status(404).json({ msg: "Demand not found" });
    }
    
    res.json(demand);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};