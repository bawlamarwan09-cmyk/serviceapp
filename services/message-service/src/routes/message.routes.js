import express from "express";
import {
    getConversations,
    getDemandById,
    getMessagesByDemand,
    markAsRead,
    sendMessage,
} from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.post("/", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/demand/:demandId", protect, getMessagesByDemand);
router.put("/demand/:demandId/read", protect, markAsRead);
router.get("/:id", protect, getDemandById);
export default router;