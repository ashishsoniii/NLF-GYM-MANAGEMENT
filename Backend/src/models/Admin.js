const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
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
  createdAt: { type: Date, default: Date.now }, // Date created
  lastLogin: { type: Date }, // Last login
  password: { type: String, required: true },
});

module.exports = mongoose.model("Admin", adminSchema);
