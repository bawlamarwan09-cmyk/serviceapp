import express from "express";
import { addRating } from "../controllers/rating.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, addRating);

export default router;
