const twilio = require('twilio');

// Helper to get available Twilio accounts
const getTwilioAccounts = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  const accounts = [];

  if (sid && token && from) {
    accounts.push({
      client: twilio(sid, token),
      from
    });
  }

  if (process.env.BACKUP_TWILIO_ACCOUNT_SID && process.env.BACKUP_TWILIO_AUTH_TOKEN) {
    accounts.push({
      client: twilio(process.env.BACKUP_TWILIO_ACCOUNT_SID, process.env.BACKUP_TWILIO_AUTH_TOKEN),
      from: process.env.BACKUP_TWILIO_PHONE_NUMBER
    });
  }

  return accounts;
};

// In-memory store for OTPs (For production, use Redis or a database)
const otpStore = {};

exports.sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string' || phone.length < 8) {
      return res.status(400).json({ success: false, message: 'Valid phone number is required' });
    }

    // Generate a 6-digit cryptographically secure or pseudo-random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to store
    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes expiration
    };

    const accounts = getTwilioAccounts();
    let sent = false;

    for (const acc of accounts) {
      try {
        await acc.client.messages.create({
          body: `Your ShieldHer Verification Code is: ${otp}. Do not share this code with anyone.`,
          from: acc.from,
          to: phone
        });
        sent = true;
        break;
      } catch (err) {
        console.warn(`[Twilio Warning] OTP send attempt failed: ${err.message}`);
      }
    }

    const responsePayload = { success: true, message: 'OTP processed' };
    if (process.env.NODE_ENV === 'development') {
      responsePayload.devOtp = otp;
    }
    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const storedData = otpStore[phone];
    
    if (!storedData) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this number' });
    }

    if (Date.now() > storedData.expiresAt) {
      delete otpStore[phone];
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (storedData.otp === otp) {
      // Verification successful
      delete otpStore[phone];
      console.log(`\x1b[32m[Auth]\x1b[0m Successfully verified ${phone}`);
      
      // In a real app, generate a JWT here
      res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        user: { phone, role: 'user' } 
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    next(error);
  }
};
