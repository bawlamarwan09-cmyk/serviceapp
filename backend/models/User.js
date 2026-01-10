import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: { type: String, enum: ["client", "prestataire"] }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
