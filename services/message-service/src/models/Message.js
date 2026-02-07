// message-service/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    demandId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // 🔑 Sender (used by chat UI)
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // 🔑 Conversation fields (used by conversations aggregation)
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// 🔍 Indexes for performance
messageSchema.index({ demandId: 1, createdAt: 1 });
messageSchema.index({ from: 1, to: 1 });
messageSchema.index({ to: 1, read: 1 });

export default mongoose.model("Message", messageSchema);
