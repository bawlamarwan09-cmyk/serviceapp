import express from "express";
import {
    createPrestataire,
    getPrestataires
} from "../controllers/prestataire.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createPrestataire);

router.get("/", getPrestataires);

export default router;
