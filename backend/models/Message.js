import mongoose from "mongoose";

export default mongoose.model(
  "Message",
  new mongoose.Schema({
    demand: { type: mongoose.Schema.Types.ObjectId, ref: "Demand" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: String
  }, { timestamps: true })
);
