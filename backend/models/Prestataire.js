import mongoose from "mongoose";

const prestataireSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    experience: {
      type: String, // أو Number (حسب اختيارك)
      required: true,
    },

    profileImage: {
      url: String,
      publicId: String,
    },

    certificateImage: {
      url: String,
      publicId: String,
    },

    availability: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Prestataire", prestataireSchema);
