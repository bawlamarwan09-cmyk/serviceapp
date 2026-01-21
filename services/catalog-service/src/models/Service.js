import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: String,
    price: Number,

    icon: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
