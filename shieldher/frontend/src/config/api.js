// Centralized API configuration for ShieldHer Frontend
// Automatically uses VITE_API_BASE_URL in production, falling back to localhost for development.

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Ensure no trailing slash
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const API_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/api/chat`,
  SOS: `${API_BASE_URL}/api/sos`,
  SOS_RESOLVE: `${API_BASE_URL}/api/sos/resolve`,
  SOS_CAMERA: `${API_BASE_URL}/api/sos/camera`,
  SOS_GPS: `${API_BASE_URL}/api/sos/gps`,
  SOS_MOTION: `${API_BASE_URL}/api/sos/motion`,
  ACTIONS_SHARE_LOCATION: `${API_BASE_URL}/api/actions/share-location`,
  ACTIONS_CALL: `${API_BASE_URL}/api/actions/call`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

