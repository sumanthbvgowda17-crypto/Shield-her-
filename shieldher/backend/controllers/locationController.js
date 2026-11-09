let locations = {};

const sanitizeCoords = (lat, lng) => {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) return null;
  if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) return null;

  return {
    lat: Number(parsedLat.toFixed(5)),
    lng: Number(parsedLng.toFixed(5))
  };
};

exports.updateLocation = (req, res, next) => {
  try {
    const { device_id, lat, lng, timestamp } = req.body;

    if (!device_id || typeof device_id !== 'string') {
      return res.status(400).json({ success: false, error: "Valid device identifier string is required." });
    }

    const coords = sanitizeCoords(lat, lng);
    if (!coords) {
      return res.status(400).json({ success: false, error: "Latitude (-90 to 90) and Longitude (-180 to 180) must be valid coordinates." });
    }

    const cleanDeviceId = device_id.slice(0, 64);

    locations[cleanDeviceId] = {
      lat: coords.lat,
      lng: coords.lng,
      timestamp: timestamp || new Date().toISOString()
    };

    res.status(200).json({ success: true, message: 'Location securely updated' });
  } catch (error) {
    next(error);
  }
};

exports.getLocation = (req, res, next) => {
  try {
    const deviceId = String(req.params.deviceId || '').slice(0, 64);
    if (!deviceId) {
      return res.status(400).json({ error: 'Valid device ID is required' });
    }
    const loc = locations[deviceId];
    if (loc) {
      res.json(loc);
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    next(error);
  }
};
