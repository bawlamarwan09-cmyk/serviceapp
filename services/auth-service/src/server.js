import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 AUTH ONLY
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("🔐 Auth Service is running");
});

app.listen(process.env.PORT, () => {
  console.log("Auth Service running on port " + process.env.PORT);
});
