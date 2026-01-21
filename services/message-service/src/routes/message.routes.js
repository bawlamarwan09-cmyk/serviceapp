import express from "express";
import {
    getMessages,
    sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/", sendMessage);
router.get("/:userId", getMessages);

export default router;
