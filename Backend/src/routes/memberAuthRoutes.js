const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const MemberOtp = require('../models/MemberOtp');
const Email = require('../models/Email');
const { sendEmail } = require('./sendEmail');

const router = express.Router();
const secretKey = process.env.JWT_SECRET;
const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// POST /member-auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const member = await Member.findOne({ email: normalizedEmail });
    if (!member) {
      return res.status(404).json({ error: 'No account found with this email. Please register first.' });
    }

    await MemberOtp.deleteMany({ email: normalizedEmail });

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await MemberOtp.create({
      email: normalizedEmail,
      otpHash,
      expiresAt,
    });

    const html = `
      <p>Your NLF Gym login OTP is: <strong>${otp}</strong></p>
      <p>It expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.</p>
    `;
    const subject = 'Your NLF Gym Login OTP';
    const sent = await sendEmail(normalizedEmail, subject, html);
    if (!sent) {
      await MemberOtp.deleteMany({ email: normalizedEmail });
      return res.status(500).json({ error: 'Failed to send OTP email. Try again later.' });
    }

    await Email.create({
      nameTo: member.name,
      subject,
      emailTo: normalizedEmail,
      category: 'otp',
    });

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// POST /member-auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = await MemberOtp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new one.' });
    }

    if (new Date() > record.expiresAt) {
      await MemberOtp.deleteOne({ _id: record._id });
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    const expectedHash = hashOtp(String(otp).trim());
    if (record.otpHash !== expectedHash) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }

    await MemberOtp.deleteOne({ _id: record._id });

    const member = await Member.findOne({ email: normalizedEmail });
    if (!member) {
      return res.status(401).json({ error: 'Member not found' });
    }

    const token = jwt.sign(
      { memberId: member._id.toString(), role: 'member' },
      secretKey,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      member: {
        _id: member._id,
        name: member.name,
        email: member.email,
        phone: member.phone,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
