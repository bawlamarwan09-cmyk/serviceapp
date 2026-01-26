import express from "express";
import {
    login,
    register,
    registerPrestataire,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/register-prestataire", registerPrestataire);

console.log(process.env.PRESTATAIRE_SERVICE_URL);

export default router;
