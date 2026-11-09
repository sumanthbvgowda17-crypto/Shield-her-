const mockAlertHistory = [
  { type: "SOS", time: "9:42 PM", location: "Sayyaji Rao Rd, Mysuru", source: "hardware" },
  { type: "Danger Zone", time: "9:38 PM", location: "Mysuru Railway Station" },
  { type: "Voice Trigger", time: "9:21 PM", location: "Chamundi Hill Rd" },
  { type: "Geofence Exit", time: "9:10 PM", location: "Mysuru Palace Area" }
];

exports.getUserAlerts = (req, res, next) => {
  try {
    // Simulate DB fetch
    res.json(mockAlertHistory);
  } catch (error) {
    next(error);
  }
};
