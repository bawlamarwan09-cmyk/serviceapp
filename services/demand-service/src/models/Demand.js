import mongoose from "mongoose";

const demandSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true },
    prestataireId: { type: String, required: true },

    serviceId: String,
    message: String,

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "done"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Demand", demandSchema);
