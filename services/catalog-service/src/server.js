import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";

import categoryRoutes from "./routes/category.routes.js";
import serviceRoutes from "./routes/service.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/categories", categoryRoutes);
app.use("/services", serviceRoutes);

app.listen(process.env.PORT, () => {
  console.log("Catalog Service running on port " + process.env.PORT);
});
