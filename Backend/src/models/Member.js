const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: String,
  membershipPlan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" }, // Current plan (if any)
  joiningDate: { type: Date, default: Date.now },
  expiryDate: { type: Date }, // Calculated in the backend
  latestPaymentDate: { type: Date, default: Date.now },
  payments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
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
});

module.exports = mongoose.model("Member", memberSchema);
