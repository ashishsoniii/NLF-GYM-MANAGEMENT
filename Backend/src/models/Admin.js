const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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
    roles: { type: [String], default: ["Admin"] },
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

adminSchema.index({ email: 1 });

module.exports = mongoose.model("Admin", adminSchema);
