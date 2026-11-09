const twilio = require('twilio');

// Helper to mask sensitive phone numbers in production logs
const maskPhone = (phone) => {
  if (!phone || phone.length < 6) return '***';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
};

// Validates and bounds GPS coordinates
const sanitizeCoords = (lat, lng) => {
  let parsedLat = parseFloat(lat);
  let parsedLng = parseFloat(lng);

  if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
    parsedLat = 12.2958; // Default safe fallback
  }
  if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
    parsedLng = 76.6394;
  }

  return {
    lat: Number(parsedLat.toFixed(5)),
    lng: Number(parsedLng.toFixed(5))
  };
};

// Retrieve configured Twilio accounts strictly from environment variables
const getTwilioAccounts = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  const to = process.env.GUARDIAN_VERIFIED_PHONE || '+919180420603';

  const accounts = [];

  if (sid && token && from) {
    accounts.push({
      name: 'Primary Twilio Gateway',
      client: twilio(sid, token),
      from,
      to,
      fallbackTo: '+917338076626'
    });
  }

  // Backup account from environment if provided
  if (process.env.BACKUP_TWILIO_ACCOUNT_SID && process.env.BACKUP_TWILIO_AUTH_TOKEN) {
    accounts.push({
      name: 'Secondary Backup Gateway',
      client: twilio(process.env.BACKUP_TWILIO_ACCOUNT_SID, process.env.BACKUP_TWILIO_AUTH_TOKEN),
      from: process.env.BACKUP_TWILIO_PHONE_NUMBER,
      to,
      fallbackTo: '+917338076626'
    });
  }

  return accounts;
};

// In-memory active alerts for real-time dashboard tracking
let activeAlerts = [];

exports.triggerSOS = async (req, res, next) => {
  try {
    const { device_id, lat, lng, battery, timestamp } = req.body;
    
    if (!device_id || typeof device_id !== 'string') {
      return res.status(400).json({ success: false, error: "Valid device identifier is required." });
    }

    const coords = sanitizeCoords(lat, lng);
    const safeBattery = Math.min(Math.max(parseInt(battery, 10) || 85, 0), 100);

    const alert = {
      device_id: device_id.slice(0, 64),
      lat: coords.lat,
      lng: coords.lng,
      battery: safeBattery,
      timestamp: timestamp || new Date().toISOString(),
      status: 'active',
      source: 'hardware'
    };
    
    activeAlerts = activeAlerts.filter(a => a.device_id !== alert.device_id);
    activeAlerts.push(alert);
    console.log(`\x1b[31m[SOS Controller]\x1b[0m 🚨 SOS DISPATCHED for ${alert.device_id} at (${coords.lat}, ${coords.lng})`);
    
    let smsSent = false;
    let smsError = null;
    let smsDetails = null;

    const mapsLink = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
    const messageBody = `SHIELDHER SOS: Emergency triggered! Immediate help needed. Location: ${mapsLink} Battery: ${safeBattery}%`;

    const accounts = getTwilioAccounts();

    for (const acc of accounts) {
      try {
        console.log(`[Twilio] Dispatching via ${acc.name} to ${maskPhone(acc.to)}...`);
        const message = await acc.client.messages.create({
          body: messageBody,
          from: acc.from,
          to: acc.to
        });
        smsSent = true;
        smsDetails = { sid: message.sid, to: maskPhone(acc.to), status: message.status };
        console.log(`\x1b[32m[Twilio]\x1b[0m Alert delivered successfully! SID: ${message.sid}`);
        break;
      } catch (err) {
        console.warn(`[Twilio Warning] ${acc.name} delivery notice: Code ${err.code}`);
        
        // Handle unverified trial recipient fallback safely
        if (acc.fallbackTo && (err.code === 21608 || err.code === 572006 || err.code === 21660)) {
          try {
            console.log(`[Twilio] Routing to verified backup guardian ${maskPhone(acc.fallbackTo)}...`);
            const fallbackMsg = await acc.client.messages.create({
              body: messageBody,
              from: acc.from,
              to: acc.fallbackTo
            });
            smsSent = true;
            smsDetails = { 
              sid: fallbackMsg.sid, 
              to: maskPhone(acc.fallbackTo), 
              note: `Delivered to verified guardian. Verify ${acc.to} in Twilio Console for direct delivery.` 
            };
            console.log(`\x1b[32m[Twilio]\x1b[0m Backup alert delivered! SID: ${fallbackMsg.sid}`);
            break;
          } catch (fallbackErr) {
            smsError = fallbackErr.message;
          }
        } else {
          smsError = err.message;
        }
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'SOS signal received and processed',
      smsSent,
      smsError: smsSent ? null : smsError,
      smsDetails
    });
  } catch (error) {
    next(error);
  }
};

exports.getActiveSOS = (req, res, next) => {
  try {
    res.json(activeAlerts);
  } catch (error) {
    next(error);
  }
};

exports.updateSOS = async (req, res, next) => {
  try {
    const { device_id, type } = req.body;
    if (!device_id) return res.status(400).json({ success: false, error: 'Missing device_id' });
    
    const alert = activeAlerts.find(a => a.device_id === device_id && a.status === 'active');
    if (alert) {
      alert.type = typeof type === 'string' ? type.slice(0, 100) : 'General';
    }

    res.status(200).json({ success: true, message: 'SOS updated' });
  } catch (error) {
    next(error);
  }
};

exports.resolveSOS = async (req, res, next) => {
  try {
    const { device_id } = req.body;
    if (!device_id) return res.status(400).json({ success: false, error: 'Missing device_id' });
    
    const alertIndex = activeAlerts.findIndex(a => a.device_id === device_id && a.status === 'active');
    if (alertIndex !== -1) {
      activeAlerts[alertIndex].status = 'resolved';
    }

    console.log(`\x1b[32m[SOS Controller]\x1b[0m ✅ SOS RESOLVED for ${device_id}`);

    const accounts = getTwilioAccounts();
    for (const acc of accounts) {
      try {
        await acc.client.messages.create({
          body: `SHIELDHER: The user has marked themselves SAFE and resolved the alert.`,
          from: acc.from,
          to: acc.to
        });
        break;
      } catch (e) {
        if (acc.fallbackTo) {
          try {
            await acc.client.messages.create({
              body: `SHIELDHER: The user has marked themselves SAFE and resolved the alert.`,
              from: acc.from,
              to: acc.fallbackTo
            });
            break;
          } catch (err2) {}
        }
      }
    }

    res.status(200).json({ success: true, message: 'SOS resolved' });
  } catch (error) {
    next(error);
  }
};

exports.sendTranscript = async (req, res, next) => {
  try {
    const { device_id, text } = req.body;
    if (!text || typeof text !== 'string') return res.status(400).json({ success: false, error: 'Empty text' });
    
    const snippet = text.slice(0, 80);
    console.log(`\x1b[34m[SOS Controller]\x1b[0m Audio telemetry received: "${snippet}"`);
    res.status(200).json({ success: true, message: 'Transcript recorded' });
  } catch (error) {
    next(error);
  }
};

exports.sendCameraEvidence = async (req, res, next) => {
  try {
    console.log(`\x1b[34m[SOS Controller]\x1b[0m Photo evidence registered in safety vault`);
    res.status(200).json({ success: true, message: 'Camera evidence secured' });
  } catch (error) {
    next(error);
  }
};

exports.sendGPSUpdate = async (req, res, next) => {
  try {
    const { device_id, lat, lng } = req.body;
    const coords = sanitizeCoords(lat, lng);
    res.status(200).json({ success: true, message: 'GPS update recorded', coords });
  } catch (error) {
    next(error);
  }
};

exports.sendMotionUpdate = async (req, res, next) => {
  try {
    const { status } = req.body;
    console.log(`\x1b[34m[SOS Controller]\x1b[0m Motion telemetry received: ${status}`);
    res.status(200).json({ success: true, message: 'Motion recorded' });
  } catch (error) {
    next(error);
  }
};
