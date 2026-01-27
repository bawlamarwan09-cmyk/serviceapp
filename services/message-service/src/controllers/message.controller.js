import axios from "axios";
import Message from "../models/Message.js";

/**
 * SEND MESSAGE
 */
export const sendMessage = async (req, res) => {
  try {
    const { to, content, demandId } = req.body;
    const from = req.user.id; // From JWT token
    const userRole = req.user.role;

    console.log("📩 Sending message");
    console.log("   From:", from, `(${userRole})`);
    console.log("   To:", to);
    console.log("   Demand ID:", demandId);

    // Validate required fields
    if (!to || !content || !demandId) {
      return res.status(400).json({ msg: "to, content, and demandId are required" });
    }

    // ✅ Prevent self-messaging
    if (from === to) {
      return res.status(400).json({ msg: "You cannot send messages to yourself" });
    }

    // ✅ Verify the sender is part of this demand
    if (process.env.DEMAND_SERVICE_URL) {
      try {
        const demandRes = await axios.get(
          `${process.env.DEMAND_SERVICE_URL}/api/demands/${demandId}`,
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );

        const demand = demandRes.data;

        // Check if user is either the client or prestataire in this demand
        const isClient = demand.clientId === from;
        const isPrestataire = demand.prestataireId === from;

        if (!isClient && !isPrestataire) {
          return res.status(403).json({ 
            msg: "You are not authorized to message on this demand" 
          });
        }

        // Verify recipient is the other party in the demand
        const expectedRecipient = isClient ? demand.prestataireId : demand.clientId;
        if (to !== expectedRecipient) {
          return res.status(400).json({ 
            msg: "You can only message the other party in this demand" 
          });
        }

      } catch (error) {
        console.warn("⚠️ Demand verification failed, continuing anyway");
        console.warn("   Error:", error.message);
      }
    }

    // Create message
    const message = await Message.create({
      from,
      to,
      content,
      demandId,
    });

    console.log("✅ Message sent:", message._id);
    res.status(201).json(message);

  } catch (error) {
    console.error("❌ SEND MESSAGE ERROR:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const getMessagesByDemand = async (req, res) => {
  try {
    const { demandId } = req.params;
    const userId = req.user.id;

    console.log("📨 Getting messages for demand:", demandId);
    console.log("   User ID:", userId);

    // ✅ Verify user is part of this demand
    if (process.env.DEMAND_SERVICE_URL) {
      try {
        const demandRes = await axios.get(
          `${process.env.DEMAND_SERVICE_URL}/api/demands/${demandId}`,
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );

        const demand = demandRes.data;

        if (demand.clientId !== userId && demand.prestataireId !== userId) {
          return res.status(403).json({ 
            msg: "You are not authorized to view messages for this demand" 
          });
        }

      } catch (error) {
        console.warn("⚠️ Demand verification failed");
      }
    }

    // Get all messages for this demand
    const messages = await Message.find({ demandId }).sort({ createdAt: 1 });

    // ✅ Mark messages sent TO current user as read
    await Message.updateMany(
      { demandId, to: userId, read: false },
      { read: true }
    );

    console.log(`✅ Found ${messages.length} messages`);
    res.json(messages);

  } catch (error) {
    console.error("❌ GET MESSAGES ERROR:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

/**
 * GET ALL CONVERSATIONS (List of demands with messages)
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("💬 Getting conversations for user:", userId);

    // Get all unique demand IDs where user sent or received messages
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { from: new mongoose.Types.ObjectId(userId) },
            { to: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $group: {
          _id: "$demandId",
          lastMessage: { $last: "$content" },
          lastMessageTime: { $last: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$to", new mongoose.Types.ObjectId(userId)] }, { $eq: ["$read", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    console.log(`✅ Found ${messages.length} conversations`);
    res.json(messages);

  } catch (error) {
    console.error("❌ GET CONVERSATIONS ERROR:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

/**
 * MARK MESSAGES AS READ
 */
export const markAsRead = async (req, res) => {
  try {
    const { demandId } = req.params;
    const userId = req.user.id;

    await Message.updateMany(
      { demandId, to: userId, read: false },
      { read: true }
    );

    console.log("✅ Messages marked as read");
    res.json({ msg: "Messages marked as read" });

  } catch (error) {
    console.error("❌ MARK AS READ ERROR:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
// GET single demand by ID
export const getDemandById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log("🔍 Getting demand:", id);
    console.log("   User ID:", userId);

    const demand = await Demand.findById(id);

    if (!demand) {
      return res.status(404).json({ msg: "Demand not found" });
    }

    // ✅ User must be either client or prestataire
    if (demand.clientId.toString() !== userId && demand.prestataireId.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized to view this demand" });
    }

    console.log("✅ Demand found");
    res.json(demand);

  } catch (error) {
    console.error("GET DEMAND BY ID ERROR:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};