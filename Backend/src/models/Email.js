const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Email schema
const emailSchema = new Schema({
  nameTo: {
    type: String,
    ref: "Member",
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  emailTo: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

const Email = mongoose.model("Email", emailSchema);

module.exports = Email;
