import mongoose from "mongoose";

export default mongoose.model(
  "Demand",
  new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    prestataire: { type: mongoose.Schema.Types.ObjectId, ref: "Prestataire" },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    message: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "refused"],
      default: "pending"
    }
  }, { timestamps: true })
);
