import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, unique: true, required: true },

    phone: String,

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["client", "prestataire"],
      required: true,
    },

    city: { type: String },

    profileImage: {
    url: String,
    publicId: String,
  },
  certificateImage: {
    url: String,
    publicId: String,
  },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
