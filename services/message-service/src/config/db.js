import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Message DB connected");
  } catch (err) {
    console.error("❌ Message DB error", err.message);
    process.exit(1);
  }
};

export default connectDB;
