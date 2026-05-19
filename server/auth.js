import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { getUsersCollection } from './db.js';

const tokenSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || process.env.MONGODB_URI;

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

export function hashValue(value) {
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex');
}

export function createOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

export function createToken(user) {
  const header = base64UrlEncode({ alg: 'HS256', typ: 'JWT' });
  const payload = base64UrlEncode({
    sub: user._id.toString(),
    identifier: user.identifier,
    channel: user.channel,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  });
  const signature = crypto
    .createHmac('sha256', tokenSecret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token) {
  if (!token) return null;

  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', tokenSecret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  const data = base64UrlDecode(payload);
  if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
  return data;
}

export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const payload = verifyToken(token);

    if (!payload?.sub) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(payload.sub) });

    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    req.user = {
      id: user._id.toString(),
      identifier: user.identifier,
      channel: user.channel
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication required.' });
  }
}
