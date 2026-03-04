const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true },
    specialization: String,
    roles: {
      type: [{ type: String, enum: ["admin", "trainer"] }],
      default: ["trainer"],
    },
    commissionRate: Number,
    isActive: { type: Boolean, default: true },
    payments: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        description: String,
      },
    ],
    lastLogin: { type: Date },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

trainerSchema.index({ email: 1 });

module.exports = mongoose.model("Trainer", trainerSchema);
