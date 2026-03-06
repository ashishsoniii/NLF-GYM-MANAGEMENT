const mongoose = require('mongoose');

const memberOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

memberOtpSchema.index({ email: 1 });
memberOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL for auto-delete

module.exports = mongoose.model('MemberOtp', memberOtpSchema);
