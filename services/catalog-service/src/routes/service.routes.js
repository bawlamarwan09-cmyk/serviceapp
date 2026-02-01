import express from "express";
import {
    createService,
    getServiceById,
    getServices,
    getServiceWithPrestataires
} from "../controllers/service.controller.js";

const router = express.Router();

router.post("/", createService);
router.get("/", getServices);
router.get("/:id/with-prestataires", getServiceWithPrestataires);
router.get("/:id", getServiceById);


export default router;
