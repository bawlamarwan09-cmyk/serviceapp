import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import demandRoutes from "./routes/demand.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/demands", demandRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Demand Service is running");
});

app.listen(process.env.PORT, () => {
  console.log("🚀 Demand Service running on port " + process.env.PORT);
});
