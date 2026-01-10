import mongoose from "mongoose";

const prestataireSchema = new mongoose.Schema(
  {
    // relation with User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // service offered
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // years of experience
    experience: {
      type: Number,
      required: true,
      min: 0,
    },

    // phone number
    phone: {
      type: String,
      required: true,
      match: [/^\+?[0-9]{9,15}$/, "Invalid phone number"],
    },

    // city
    city: {
      type: String,
      required: true,
    },

    // profile image (face)
    profileImage: {
      type: String,
      required: true,
    },

    // certificate image
    certificateImage: {
      type: String,
      required: true,
    },

    // availability
    availability: {
      type: Boolean,
      default: true,
    },

    // admin validation
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Prestataire", prestataireSchema);
