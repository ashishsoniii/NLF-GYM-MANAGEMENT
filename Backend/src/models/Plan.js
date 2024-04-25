const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: {
    type: Number,
    required: true,
  },
  price: { type: Number, required: true },
  description: String,
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Plan", planSchema);
