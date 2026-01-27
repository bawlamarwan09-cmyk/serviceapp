import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import messageRoutes from "./routes/message.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/api/messages", messageRoutes);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/message-db")
  .then(() => console.log("✅ Message DB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`✅ Message Service running on http://localhost:${PORT}`);
});