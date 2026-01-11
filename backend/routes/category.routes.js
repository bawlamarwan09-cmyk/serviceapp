import express from "express";
import {
    createCategory,
    deleteCategory,
    getCategories,
    getCategoryById,
} from "../controllers/category.controller.js";
import { adminOnly, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Public
 */
router.get("/", getCategories);
router.get("/:id", getCategoryById);

/**
 * Admin
 */
router.post("/", protect, adminOnly, createCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;
