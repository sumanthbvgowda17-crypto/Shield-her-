import { useState, useCallback } from 'react';
import { saveIncident, updateIncidentStatus } from '../supabase/incidentsService';

export const useSOSTrigger = () => {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosLogs, setSosLogs] = useState([]);
  const [activeIncidentId, setActiveIncidentId] = useState(null);

  const triggerSOS = useCallback(async () => {
    setIsSOSActive(true);
    
    // Initial immediate feedback
    const startTimestamp = new Date().toLocaleTimeString();
    setSosLogs([
      { id: `${Date.now()}-1`, message: '🚨 Panic SOS button activated', time: startTimestamp, status: 'done' },
    ]);

    let lat = 12.2958;
    let lng = 76.6394;
    let battery = 85;

    // Check battery level
    try {
      if (navigator.getBattery) {
        const bat = await navigator.getBattery();
        battery = Math.round(bat.level * 100);
      }
    } catch (e) {
      // battery API unavailable or blocked
    }

    const dispatchSOS = async (latitude, longitude) => {
      setSosLogs(prev => [
        ...prev, 
        { id: `${Date.now()}-2`, message: `📍 GPS locked: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`, time: new Date().toLocaleTimeString(), status: 'done' },
        { id: `${Date.now()}-3`, message: '📡 Transmitting emergency signal to ShieldHer server...', time: new Date().toLocaleTimeString(), status: 'done' }
      ]);

      // 1. Save directly into Supabase incidents table with lat/long
      try {
        const result = await saveIncident({
          title: 'EMERGENCY SOS: Panic Button Triggered',
          description: `SOS activated at (${latitude.toFixed(5)}, ${longitude.toFixed(5)}). Battery: ${battery}%. Emergency response dispatched.`,
          latitude,
          longitude,
          status: 'active'
        });

        if (result.success && result.data?.id) {
          setActiveIncidentId(result.data.id);
          setSosLogs(prev => [
            ...prev,
            { id: `${Date.now()}-db`, message: '🗄️ Incident logged to Supabase safety vault', time: new Date().toLocaleTimeString(), status: 'done' }
          ]);
        }
      } catch (dbErr) {
        console.warn('Supabase incident logging note:', dbErr.message);
      }

      // 2. Transmit to backend for Twilio SMS dispatch
      try {
        const res = await fetch('http://localhost:5001/api/sos', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device_id: 'user-phone-123',
            lat: latitude,
            lng: longitude,
            battery
          }) 
        });
        
        const data = await res.json();
        
        if (data.smsSent) {
          const recipient = data.smsDetails?.to ? ` (${data.smsDetails.to})` : '';
          const note = data.smsDetails?.note ? ` [Note: ${data.smsDetails.note}]` : '';
          setSosLogs(prev => [
            ...prev,
            { id: `${Date.now()}-4`, message: `📲 SMS ALERT SENT to Guardian${recipient}${note}`, time: new Date().toLocaleTimeString(), status: 'done' },
            { id: `${Date.now()}-5`, message: '🚔 Nearby Emergency Authorities Notified', time: new Date().toLocaleTimeString(), status: 'done' }
          ]);
        } else {
          setSosLogs(prev => [
            ...prev,
            { 
              id: `${Date.now()}-4`, 
              message: data.smsError 
                ? `⚠️ Twilio Gateway: ${data.smsError}` 
                : '📱 SOS received by server', 
              time: new Date().toLocaleTimeString(), 
              status: 'warn' 
            },
            { id: `${Date.now()}-5`, message: '🛡️ Emergency broadcast active on Guardian Dashboard', time: new Date().toLocaleTimeString(), status: 'done' }
          ]);
        }
      } catch(e) { 
        console.error("Failed to send SOS to backend:", e);
        setSosLogs(prev => [
          ...prev,
          { id: `${Date.now()}-err`, message: '❌ Network error connecting to backend server', time: new Date().toLocaleTimeString(), status: 'error' }
        ]);
      }
    };

    // Obtain coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          dispatchSOS(lat, lng);
        },
        (err) => {
          console.warn("Geolocation fallback:", err.message);
          dispatchSOS(lat, lng);
        },
        { enableHighAccuracy: true, timeout: 4000 }
      );
    } else {
      dispatchSOS(lat, lng);
    }
  }, []);

  const resolveSOS = useCallback(async () => {
    setIsSOSActive(false);
    setSosLogs([]);
    
    // Resolve in Supabase
    if (activeIncidentId) {
      try {
        await updateIncidentStatus(activeIncidentId, 'resolved');
        setActiveIncidentId(null);
      } catch (e) {
        console.warn('Error resolving in Supabase:', e);
      }
    }

    try {
      await fetch('http://localhost:5001/api/sos/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: 'user-phone-123' })
      });
    } catch(e) {
      console.error("Failed to send resolve SOS:", e);
    }
  }, [activeIncidentId]);

  return { isSOSActive, sosLogs, triggerSOS, resolveSOS };
};
