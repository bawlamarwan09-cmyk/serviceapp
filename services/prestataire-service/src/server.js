import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import prestataireRoutes from "./routes/prestataire.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/prestataires", prestataireRoutes);

app.listen(process.env.PORT, () => {
  console.log("Prestataire Service running on port " + process.env.PORT);
});
