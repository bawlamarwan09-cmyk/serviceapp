import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  demandId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Demand",
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for faster queries
messageSchema.index({ from: 1, to: 1, createdAt: 1 });
messageSchema.index({ demandId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);