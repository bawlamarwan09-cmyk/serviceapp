import mongoose from "mongoose";

export default mongoose.model(
  "Rating",
  new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    prestataire: { type: mongoose.Schema.Types.ObjectId, ref: "Prestataire" },
    rate: Number,
    comment: String
  }, { timestamps: true })
);
