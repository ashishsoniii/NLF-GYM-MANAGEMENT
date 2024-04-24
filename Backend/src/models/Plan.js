const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: {
    type: String,
    required: true,
    enum: ["Monthly", "Quarterly", "Yearly"],
  },
  price: { type: Number, required: true },
  description: String,
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Plan", planSchema);
