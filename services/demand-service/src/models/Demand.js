import mongoose from "mongoose";

const demandSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  prestataireId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Service",
  },
  message: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending",
  },
  // ✅ NEW: Location fields
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: undefined,
    },
    address: {
      type: String,
    },
    confirmedBy: {
      type: String,
      enum: ['prestataire', 'client', 'both'],
    },
    confirmedAt: {
      type: Date,
    },
  },
  // ✅ NEW: Appointment time
  appointmentDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// ✅ Index for geospatial queries
demandSchema.index({ "location.coordinates": "2dsphere" });

export default mongoose.model("Demand", demandSchema);