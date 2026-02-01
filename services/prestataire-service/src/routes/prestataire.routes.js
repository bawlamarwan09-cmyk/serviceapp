import express from "express";
import {
    createPrestataire,
    getPrestataireById,
    getPrestataires,
    getPrestatairesByService,
    verifyPrestataire,
} from "../controllers/prestataire.controller.js";

import { adminOnly, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createPrestataire);
router.get("/", getPrestataires);
router.put("/:id/verify", protect, adminOnly, verifyPrestataire);
router.get("/:id", getPrestataireById);
router.get("/by-service/:serviceId", getPrestatairesByService);

export default router;
