import express from "express";
import {
    getConversations,
    getMessagesByDemand,
    getMessagesByDemands,
    initConversation,
    sendMessage,
} from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.post("/", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/demand/:demandId", protect, getMessagesByDemand);
router.post("/init-conversation", protect, initConversation);  // ✅ Add this
router.get("/:demandId", protect, getMessagesByDemands);


export default router;