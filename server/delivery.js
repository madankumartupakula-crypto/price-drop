import nodemailer from 'nodemailer';

export function normalizeIdentifier(identifier) {
  const value = String(identifier || '').trim().toLowerCase();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const phone = value.replace(/[^\d+]/g, '');
  const isPhone = /^\+?[1-9]\d{9,14}$/.test(phone);

  if (isEmail) return { channel: 'email', identifier: value };
  if (isPhone) return { channel: 'phone', identifier: phone.startsWith('+') ? phone : `+${phone}` };
  return { channel: null, identifier: value };
}

async function sendEmailOtp(identifier, otp) {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`Email OTP is not fully configured. Missing: ${missing.join(', ')} - falling back to a test account.`);

    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await transporter.sendMail({
      from: `PricePulse <${testAccount.user}>`,
      to: identifier,
      subject: 'Your PricePulse login OTP (test)',
      text: `Your PricePulse OTP is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your PricePulse OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`
    });

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Preview email available at:', preview);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: identifier,
    subject: 'Your PricePulse login OTP',
    text: `Your PricePulse OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your PricePulse OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`
  });
}

async function sendSmsOtp(identifier, otp) {
  const required = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Phone OTP is not configured. Missing: ${missing.join(', ')}`);
  }

  const body = new URLSearchParams({
    From: process.env.TWILIO_FROM,
    To: identifier,
    Body: `Your PricePulse OTP is ${otp}. It expires in 10 minutes.`
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'content-type': 'application/x-www-form-urlencoded'
      },
      body
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Twilio rejected the OTP message: ${message}`);
  }
}

export async function sendOtp({ channel, identifier, otp }) {
  if (channel === 'email') {
    await sendEmailOtp(identifier, otp);
    return;
  }

  if (channel === 'phone') {
    await sendSmsOtp(identifier, otp);
    return;
  }

  throw new Error('Enter a valid email address or phone number.');
}
