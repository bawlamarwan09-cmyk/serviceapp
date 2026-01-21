import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Demand DB connected");
  } catch (err) {
    console.error("❌ Demand DB error", err.message);
    process.exit(1);
  }
};

export default connectDB;
