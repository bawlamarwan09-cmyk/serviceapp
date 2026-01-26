import express from "express";
import {
    createService,
    getServiceById,
    getServiceWithPrestataires,
    getServices,
} from "../controllers/service.controller.js";

const router = express.Router();

router.post("/", createService);
router.get("/", getServices);
router.get("/:id", getServiceById);
router.get("/:id/with-prestataires", getServiceWithPrestataires);


export default router;
