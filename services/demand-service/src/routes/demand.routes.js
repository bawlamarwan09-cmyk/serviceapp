import express from "express";
import {
    createDemand,
    getMyDemands,
    updateStatus,
} from "../controllers/demand.controller.js";
import { protect } from "../middleware/auth.js"; // ← Import protect

const router = express.Router();

// ✅ Add protect middleware to ALL routes
router.post("/", protect, createDemand);
router.get("/me", protect, getMyDemands);
router.put("/:id/status", protect, updateStatus);

export default router;