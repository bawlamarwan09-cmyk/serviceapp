import axios from "axios";
import mongoose from "mongoose";
import Message from "../models/Message.js";
export const sendMessage = async (req, res) => {
  try {
    const { demandId, content } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;

    if (!demandId || !content?.trim()) {
      return res.status(400).json({ msg: "demandId and content are required" });
    }

    let recipientId = null;

    if (process.env.DEMAND_SERVICE_URL) {
      try {
        const demandRes = await axios.get(
          `${process.env.DEMAND_SERVICE_URL}/demands/${demandId}`,
          {
            headers: { Authorization: req.headers.authorization },
            timeout: 5000,
          }
        );

        const demand = demandRes.data;

        if (senderRole === "client") {
          if (demand.clientId?.toString() !== senderId) {
            return res
              .status(403)
              .json({ msg: "Access denied - not your demand" });
          }
          recipientId = demand.prestataireId?.toString();
        } else if (senderRole === "prestataire") {
          if (demand.prestataireId?.toString() !== senderId) {
            return res
              .status(403)
              .json({ msg: "Access denied - not your demand" });
          }
          recipientId = demand.clientId?.toString();
        } else {
          return res.status(403).json({ msg: "Invalid user role" });
        }

        if (!recipientId) {
          return res.status(400).json({ msg: "Recipient not found" });
        }
      } catch (error) {
        return res.status(403).json({ msg: "Access denied" });
      }
    } else {
      return res.status(500).json({ msg: "DEMAND_SERVICE_URL not configured" });
    }

    const message = await Message.create({
      demandId,
      from: senderId,
      to: recipientId,
      senderId: senderId,
      recipientId: recipientId,
      content: content.trim(),
      read: false,
    });


    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const getMessagesByDemand = async (req, res) => {
  try {
    const { demandId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    if (process.env.DEMAND_SERVICE_URL) {
      try {
        const demandRes = await axios.get(
          `${process.env.DEMAND_SERVICE_URL}/demands/${demandId}`,
          {
            headers: { Authorization: req.headers.authorization }
          }
        );
        
        const demand = demandRes.data;
        let hasAccess = false;

        if (userRole === "client") {
          hasAccess = demand.clientId.toString() === userId;
        } else if (userRole === "prestataire") {
          try {
            const prestataireResponse = await axios.get(
              `${process.env.PRESTATAIRE_SERVICE_URL}/${userId}`,
              {
                headers: { Authorization: req.headers.authorization },
                timeout: 5000,
              }
            );

            const prestataireId = prestataireResponse.data._id.toString();
            hasAccess = demand.prestataireId.toString() === prestataireId;

          } catch (error) {
            return res.status(403).json({ msg: "Access denied" });
          }
        }

        if (!hasAccess) {
          return res.status(403).json({ msg: "Access denied" });
        }
      } catch (error) {
        return res.status(403).json({ msg: "Access denied" });
      }
    }

    const messages = await Message.find({ demandId })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);

  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

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

export const initConversation = async (req, res) => {
  try {
    const { demandId, clientId, prestataireId, initialMessage } = req.body;
    const senderId = req.user.id;
    if (senderId !== prestataireId) {
      return res.status(403).json({ msg: "Only prestataire can initialize conversation" });
    }

    const existingMessages = await Message.find({ demandId });
    
    if (existingMessages.length > 0) {
      return res.json({ msg: "Conversation already exists", messages: existingMessages });
    }
    const message = await Message.create({
      demandId,
      from: prestataireId,
      to: clientId,
      content: initialMessage || "Hello! I have accepted your request.",
      read: false
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
export const getMessagesByDemands = async (req, res) => {
  try {
    const { demandId } = req.params;
    const userId = req.user.id;

    const list = await Message.find({
      demandId,
      $or: [{ from: userId }, { to: userId }],
    }).sort({ createdAt: 1 });

    return res.json(list);
  } catch (error) {
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};
