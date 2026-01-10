import mongoose from "mongoose";

export default mongoose.model(
  "Service",
  new mongoose.Schema({
    name: String,
    description: String,
    price: Number
  })
);
