import express from "express";
import {
    acceptDemand,
    createDemand,
    getPrestataireDemands,
    refuseDemand
} from "../controllers/demand.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createDemand);
router.get("/prestataire", protect, getPrestataireDemands);
router.patch("/:id/accept", protect, acceptDemand);
router.patch("/:id/refuse", protect, refuseDemand);

export default router;
