import express from "express";
import {
    createDemand,
    getMyDemands,
    updateStatus,
} from "../controllers/demand.controller.js";

const router = express.Router();

router.post("/", createDemand);
router.get("/me", getMyDemands);
router.put("/:id/status", updateStatus);

export default router;
