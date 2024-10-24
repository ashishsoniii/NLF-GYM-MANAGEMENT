const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  membershipPlan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" }, // Current plan (if any)
  joiningDate: { type: Date, default: Date.now, required: true },
  expiryDate: { type: Date, required: true }, // Calculated in the backend
  latestPaymentDate: { type: Date, default: Date.now, required: true },
  latestPaymentAmount: { type: String, required: true },
  latestPlanName: { type: String, required: true, required: true },
  payments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      joiningDate: { type: Date, default: Date.now, required: true },
      expiryDate: { type: Date, required: true }, // Calculated in the backend
      paymentMethod: {
        type: String,
        enum: ["Cash", "Card", "Online"],
        required: true,
      },
      plan: {
        planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
        name: String,
        duration: String,
        price: Number,
      },
    },
  ],
  assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" },
  workoutType: {
    type: String,
    enum: ["Fitness", "Weight Lifting" /* Add more as needed */],
    default: "Fitness",
  },
  isActive: { type: Boolean, default: true },
  notes: String,
  profileImage: Buffer, 
});

module.exports = mongoose.model("Member", memberSchema);
