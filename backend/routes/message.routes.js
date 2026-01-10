import express from "express";
import {
    getMessagesByDemand,
    sendMessage
} from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:demandId", protect, getMessagesByDemand);

export default router;
