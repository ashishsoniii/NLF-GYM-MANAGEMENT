const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EMAIL_CATEGORIES = ["broadcast", "otp", "welcome", "invoice", "custom"];

const emailSchema = new Schema(
  {
    nameTo: { type: String, required: true },
    subject: { type: String, required: true },
    emailTo: { type: String, required: true },
    category: {
      type: String,
      enum: EMAIL_CATEGORIES,
      default: "broadcast",
      required: true,
    },
    memberId: { type: Schema.Types.ObjectId, ref: "Member" },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
    errorMessage: String,
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

emailSchema.index({ sentAt: -1 });
emailSchema.index({ category: 1, sentAt: -1 });

const Email = mongoose.model("Email", emailSchema);

module.exports = Email;
