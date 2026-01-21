import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import messageRoutes from "./routes/message.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("💬 Message Service is running");
});

app.listen(process.env.PORT, () => {
  console.log("💬 Message Service running on port " + process.env.PORT);
});
