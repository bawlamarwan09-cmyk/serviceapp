import express from "express";
import {
  confirmMeetingLocation,
  createDemand,
  getDemandById,
  getMyDemands,
  setMeetingLocation,
  updateStatus,
} from "../controllers/demand.controller.js";

import { onlyPrestataire, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createDemand);

router.get("/me", protect, getMyDemands);

router.get("/:id", protect, getDemandById);  // ✅ Add this route

router.put("/:id/status", protect, onlyPrestataire, updateStatus);

router.put("/:id/location", protect, onlyPrestataire, setMeetingLocation);

router.put(
  "/:id/location/confirm",
  protect,
  onlyPrestataire,
  confirmMeetingLocation
);

export default router;
