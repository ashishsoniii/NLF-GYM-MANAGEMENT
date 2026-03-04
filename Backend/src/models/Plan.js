const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    duration: {
      type: Number,
      required: true,
      min: [1, "Duration must be at least 1 month"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

planSchema.index({ isActive: 1 });

module.exports = mongoose.model("Plan", planSchema);
