import axios from "axios";
import Message from "../models/Message.js";
import mongoose from "mongoose"; 

export const sendMessage = async (req, res) => {
  try {
    const { to, content, demandId } = req.body;
    const from = req.user.id;

    // 1. Basic Validation
    if (!to || !content || !demandId) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    // 2. Cross-Service Validation (Optional but recommended)
    // We check with Demand Service if this 'from' and 'to' actually belong to this demand
    const demandCheck = await axios.get(
      `${process.env.DEMAND_SERVICE_URL}/api/demands/${demandId}`,
      { headers: { Authorization: req.headers.authorization } }
    );
    
    const demand = demandCheck.data;
    const participants = [demand.clientId.toString(), demand.prestataireId.toString()];
    
    if (!participants.includes(from) || !participants.includes(to)) {
      return res.status(403).json({ msg: "User not part of this demand" });
    }

    // 3. Save to DB
    const newMessage = await Message.create({
      from,
      to,
      demandId,
      content,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error.message);
    res.status(500).json({ msg: "Message delivery failed" });
  }
};

/**
 * GET MESSAGES BY DEMAND
 */
export const getMessagesByDemand = async (req, res) => {
  try {
    const { demandId } = req.params;
    const userId = req.user.id;

    // Verify user is part of demand (Similar logic to sendMessage)
    if (process.env.DEMAND_SERVICE_URL) {
        const demandRes = await axios.get(`${process.env.DEMAND_SERVICE_URL}/api/demands/${demandId}`, {
            headers: { Authorization: req.headers.authorization }
        });
        const d = demandRes.data;
        if (d.clientId.toString() !== userId && d.prestataireId.toString() !== userId) {
            return res.status(403).json({ msg: "Access denied" });
        }
    }

    const messages = await Message.find({ demandId }).sort({ createdAt: 1 });

    // Mark messages as read if the recipient is the current user
    await Message.updateMany(
      { demandId, to: userId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET ALL CONVERSATIONS
 */
export const getConversations = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ from: userId }, { to: userId }],
        },
      },
      { $sort: { createdAt: -1 } }, 
      {
        $group: {
          _id: "$demandId",
          lastMessage: { $first: "$content" }, 
          lastMessageTime: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$to", userId] }, { $eq: ["$read", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageTime: -1 } },
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ msg: "Aggregation error", error: error.message });
  }
};