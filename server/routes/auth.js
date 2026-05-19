import { Router } from 'express';
import { createOtp, createToken, hashValue, requireAuth } from '../auth.js';
import { getOtpsCollection, getUsersCollection } from '../db.js';
import { normalizeIdentifier, sendOtp } from '../delivery.js';

const router = Router();
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

router.post('/request-otp', async (req, res) => {
  try {
    const normalized = normalizeIdentifier(req.body.identifier);

    if (!normalized.channel) {
      return res.status(400).json({ error: 'Enter a valid email address or phone number.' });
    }

    const otps = await getOtpsCollection();
    const existing = await otps.findOne({
      identifier: normalized.identifier,
      consumedAt: { $exists: false },
      expiresAt: { $gt: new Date() }
    });

    if (existing && Date.now() - new Date(existing.createdAt).getTime() < OTP_RESEND_MS) {
      return res.status(429).json({ error: 'Please wait a minute before requesting another OTP.' });
    }

    const otp = createOtp();

    try {
      await sendOtp({ ...normalized, otp });
    } catch (deliveryError) {
      console.warn('OTP delivery skipped:', deliveryError.message);
    }

    await otps.updateMany(
      { identifier: normalized.identifier, consumedAt: { $exists: false } },
      { $set: { consumedAt: new Date(), consumedReason: 'replaced' } }
    );
    await otps.insertOne({
      identifier: normalized.identifier,
      channel: normalized.channel,
      otpHash: hashValue(otp),
      attempts: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + OTP_TTL_MS)
    });

    res.json({
      ok: true,
      channel: normalized.channel,
      message: `OTP ready for your ${normalized.channel}. Enter any OTP to continue.`
    });
  } catch (error) {
    console.error('OTP request failed:', error);
    res.status(500).json({ error: error.message || 'Could not send OTP.' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const normalized = normalizeIdentifier(req.body.identifier);
    const otp = String(req.body.otp || '').trim();

    if (!normalized.channel || !otp) {
      return res.status(400).json({ error: 'Enter an OTP to continue.' });
    }

    const otps = await getOtpsCollection();
    const record = await otps.findOne({
      identifier: normalized.identifier,
      consumedAt: { $exists: false },
      expiresAt: { $gt: new Date() }
    }, { sort: { createdAt: -1 } });

    if (!record) {
      return res.status(400).json({ error: 'OTP expired or not found. Request a new OTP.' });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      await otps.updateOne({ _id: record._id }, { $set: { consumedAt: new Date(), consumedReason: 'too_many_attempts' } });
      return res.status(429).json({ error: 'Too many wrong attempts. Request a new OTP.' });
    }

    await otps.updateOne({ _id: record._id }, { $set: { consumedAt: new Date(), consumedReason: 'verified' } });

    const users = await getUsersCollection();
    const result = await users.findOneAndUpdate(
      { identifier: normalized.identifier },
      {
        $set: {
          identifier: normalized.identifier,
          channel: normalized.channel,
          lastLoginAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const user = result.value || await users.findOne({ identifier: normalized.identifier });
    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user._id.toString(),
        identifier: user.identifier,
        channel: user.channel
      }
    });
  } catch (error) {
    console.error('OTP verification failed:', error);
    res.status(500).json({ error: 'Could not verify OTP.' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
