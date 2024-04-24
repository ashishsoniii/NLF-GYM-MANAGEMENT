const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  specialization: String,
  availability: [
    {
      dayOfWeek: { type: String, enum: ["Monday", "Tuesday", "Sunday"] },
      startTime: Date,
      endTime: Date,
    },
  ],
  roles: { type: [String], default: ["trainer"], enum: ["admin", "trainer"] },
  commissionRate: Number,
  isActive: { type: Boolean, default: true },
  payments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      description: String,
    },
  ],
});

module.exports = mongoose.model("Trainer", trainerSchema);
