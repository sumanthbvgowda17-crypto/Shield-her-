const twilio = require('twilio');

const getTwilioAccounts = () => {
  const primarySid = process.env.TWILIO_ACCOUNT_SID;
  const primaryAuth = process.env.TWILIO_AUTH_TOKEN;
  const primaryFrom = process.env.TWILIO_PHONE_NUMBER;
  const primaryTo = process.env.GUARDIAN_VERIFIED_PHONE || '+919180420603';

  const accounts = [];
  if (primarySid && primaryAuth && primaryFrom) {
    accounts.push({
      client: twilio(primarySid, primaryAuth),
      from: primaryFrom,
      to: primaryTo,
      fallbackTo: '+917338076626'
    });
  }

  if (process.env.BACKUP_TWILIO_ACCOUNT_SID && process.env.BACKUP_TWILIO_AUTH_TOKEN) {
    accounts.push({
      client: twilio(process.env.BACKUP_TWILIO_ACCOUNT_SID, process.env.BACKUP_TWILIO_AUTH_TOKEN),
      from: process.env.BACKUP_TWILIO_PHONE_NUMBER,
      to: primaryTo,
      fallbackTo: '+917338076626'
    });
  }

  return accounts;
};

exports.shareLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ success: false, message: 'Valid Latitude and Longitude are required' });
    }

    const mapsLink = `https://maps.google.com/?q=${parsedLat.toFixed(5)},${parsedLng.toFixed(5)}`;
    const accounts = getTwilioAccounts();
    let sent = false;

    for (const acc of accounts) {
      try {
        await acc.client.messages.create({
          body: `SHIELDHER UPDATE: Live location shared: ${mapsLink}`,
          from: acc.from,
          to: acc.to
        });
        sent = true;
        break;
      } catch (err) {
        if (acc.fallbackTo) {
          try {
            await acc.client.messages.create({
              body: `SHIELDHER UPDATE: Live location shared: ${mapsLink}`,
              from: acc.from,
              to: acc.fallbackTo
            });
            sent = true;
            break;
          } catch (e2) {}
        }
      }
    }

    res.status(200).json({ success: true, message: 'Location shared successfully via SMS', sent });
  } catch (error) {
    next(error);
  }
};

exports.initiateCall = async (req, res, next) => {
  try {
    const accounts = getTwilioAccounts();
    let callInitiated = false;

    for (const acc of accounts) {
      try {
        await acc.client.calls.create({
          twiml: '<Response><Say voice="alice">This is a simulated safety call from ShieldHer. Please pretend you are speaking to the user so they can safely exit their current situation.</Say><Pause length="5"/><Say voice="alice">The user has now disconnected. Goodbye.</Say></Response>',
          from: acc.from,
          to: acc.to
        });
        callInitiated = true;
        break;
      } catch (err) {
        if (acc.fallbackTo) {
          try {
            await acc.client.calls.create({
              twiml: '<Response><Say voice="alice">This is a simulated safety call from ShieldHer.</Say></Response>',
              from: acc.from,
              to: acc.fallbackTo
            });
            callInitiated = true;
            break;
          } catch (e2) {}
        }
      }
    }

    res.status(200).json({ success: true, message: 'Phone call initiated', callInitiated });
  } catch (error) {
    next(error);
  }
};
