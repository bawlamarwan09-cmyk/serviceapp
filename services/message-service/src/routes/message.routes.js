import express from "express";
import {
    getConversations,
    getMessagesByDemand,
    sendMessage,
} from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.post("/", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/demand/:demandId", protect, getMessagesByDemand);
export default router;