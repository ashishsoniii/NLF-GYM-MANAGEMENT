const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true },
    address: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    membershipPlan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    joiningDate: { type: Date, default: Date.now, required: true },
    expiryDate: { type: Date, required: true },
    latestPaymentDate: { type: Date, default: Date.now, required: true },
    latestPaymentAmount: { type: Number, required: true },
    latestPlanName: { type: String, required: true },
    payments: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        joiningDate: { type: Date, default: Date.now, required: true },
        expiryDate: { type: Date, required: true },
        paymentMethod: {
          type: String,
          enum: ["Cash", "Card", "Online"],
          required: true,
        },
        plan: {
          planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
          name: String,
          duration: Number,
          price: Number,
        },
      },
    ],
    assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" },
    workoutType: {
      type: String,
      enum: ["Fitness", "Weight Lifting", "Cardio", "Yoga", "General"],
      default: "Fitness",
    },
    emergencyContact: String,
    isActive: { type: Boolean, default: true },
    notes: String,
    profileImage: Buffer,
    profileImageContentType: { type: String, default: "image/jpeg" },
  },
  { timestamps: true }
);

memberSchema.index({ isActive: 1 });
memberSchema.index({ expiryDate: 1 });
memberSchema.index({ joiningDate: 1 });
memberSchema.index({ email: 1 });

module.exports = mongoose.model("Member", memberSchema);
