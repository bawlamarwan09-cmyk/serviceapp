import express from "express";
import {
    createService,
    getServiceById,
    getServices,
} from "../controllers/service.controller.js";

const router = express.Router();

router.post("/", createService);
router.get("/", getServices);
router.get("/:id", getServiceById);

export default router;
