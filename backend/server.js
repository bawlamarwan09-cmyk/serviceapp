import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import demandRoutes from "./routes/demand.routes.js";
import messageRoutes from "./routes/message.routes.js";
import prestataireRoutes from "./routes/prestataire.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import serviceRoutes from "./routes/service.routes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/prestataires", prestataireRoutes);
app.use("/api/demands", demandRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ratings", ratingRoutes);

app.listen(process.env.PORT, () =>
  console.log("Server running on port " + process.env.PORT)
);
