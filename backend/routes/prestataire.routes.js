import express from "express";
import {
    createPrestataire,
    getMyPrestataire,
    getPrestataires,
    verifyPrestataire,
} from "../controllers/prestataire.controller.js";
import { adminOnly, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Create prestataire (logged user)
 */
router.post("/", protect, createPrestataire);

/**
 * Get all verified prestataires (public)
 */
router.get("/", getPrestataires);

/**
 * Get my prestataire profile
 */
router.get("/me", protect, getMyPrestataire);

/**
 * Admin: verify prestataire
 */
router.patch("/:id/verify", protect, adminOnly, verifyPrestataire);

export default router;
