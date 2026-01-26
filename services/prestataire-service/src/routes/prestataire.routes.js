import express from "express";
import {
    createPrestataire,
    getPrestataireById,
    getPrestataires,
    verifyPrestataire,
} from "../controllers/prestataire.controller.js";

import { adminOnly, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createPrestataire);
router.get("/", getPrestataires);
router.put("/:id/verify", protect, adminOnly, verifyPrestataire);
router.get("/:id", getPrestataireById);

export default router;
