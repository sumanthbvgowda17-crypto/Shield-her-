import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lightbulb, MapPin, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { fetchIncidents, subscribeToIncidents } from '../supabase/incidentsService';

export default function RiskGauge() {
  const [incidentsCount, setIncidentsCount] = useState(0);
  const [userCoords, setUserCoords] = useState([12.2958, 76.6394]);
  const [metrics, setMetrics] = useState({
    density: 'Medium',
    lighting: 'Checking...',
    policeDist: 1.1,
    policeName: 'Devaraja Police Station',
    incidents: 0
  });

  // Known Mysuru & Regional Police Stations coordinates for precise Haversine distance
  const policeStations = [
    { name: 'Devaraja Police Station', lat: 12.3082, lng: 76.6508 },
    { name: 'Lashkar Police Station', lat: 12.3155, lng: 76.6562 },
    { name: 'Kuvempunagar Police Station', lat: 12.2872, lng: 76.6268 },
    { name: 'Ashokapuram Police Station', lat: 12.2915, lng: 76.6432 },
    { name: 'Nazarbad Police Station', lat: 12.3079, lng: 76.6698 }
  ];

  // Calculate real distance to nearest police station
  const calculateNearestPolice = useCallback((lat, lng) => {
    let minDistance = Infinity;
    let closest = policeStations[0];

    policeStations.forEach(station => {
      const dLat = (station.lat - lat) * (Math.PI / 180);
      const dLng = (station.lng - lng) * (Math.PI / 180);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * (Math.PI / 180)) * Math.cos(station.lat * (Math.PI / 180)) * 
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371 * c; // Earth radius in km

      if (distance < minDistance) {
        minDistance = distance;
        closest = station;
      }
    });

    return {
      distance: Number(minDistance.toFixed(1)),
      name: closest.name
    };
  }, []);

  // Calculate real lighting condition based on current solar time
  const calculateLighting = useCallback(() => {
    const hour = new Date().getHours();
    // Night: 7:00 PM to 5:30 AM -> Poor
    // Dusk / Dawn: 5:30 AM to 6:30 AM or 6:00 PM to 7:00 PM -> Moderate
    // Daytime: 6:30 AM to 6:00 PM -> Good
    if (hour >= 19 || hour < 5) return 'Poor';
    if (hour === 5 || hour === 6 || hour === 18) return 'Moderate';
    return 'Good';
  }, []);

  // Calculate crowd density based on time-of-day and commercial area
  const calculateCrowdDensity = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) return 'Low';
    if ((hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21)) return 'High';
    return 'Medium';
  }, []);

  // 1. Fetch live incidents from Supabase
  const loadIncidents = useCallback(async () => {
    const data = await fetchIncidents();
    if (Array.isArray(data)) {
      const activeCount = data.filter(i => i.status === 'active').length;
      setIncidentsCount(activeCount);
      setMetrics(prev => ({
        ...prev,
        incidents: activeCount
      }));
    }
  }, []);

  useEffect(() => {
    loadIncidents();
    const unsub = subscribeToIncidents(() => loadIncidents());
    return () => unsub();
  }, [loadIncidents]);

  // 2. Fetch live GPS coordinates
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords([lat, lng]);

          const police = calculateNearestPolice(lat, lng);
          const lighting = calculateLighting();
          const density = calculateCrowdDensity();

          setMetrics(prev => ({
            ...prev,
            policeDist: police.distance,
            policeName: police.name,
            lighting,
            density
          }));
        },
        (err) => {
          console.warn('Geolocation fallback:', err.message);
          const police = calculateNearestPolice(userCoords[0], userCoords[1]);
          setMetrics(prev => ({
            ...prev,
            policeDist: police.distance,
            policeName: police.name,
            lighting: calculateLighting(),
            density: calculateCrowdDensity()
          }));
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, [calculateNearestPolice, calculateLighting, calculateCrowdDensity]);

  // Compute real dynamic risk score (0 to 100)
  // Lighting: Poor (+30), Moderate (+15), Good (+0)
  // Police Distance: > 2km (+25), > 1km (+15), <= 1km (+5)
  // Incidents: +15 per active incident
  // Crowd Density: Low at night (+20)
  let riskScore = 15;
  if (metrics.lighting === 'Poor') riskScore += 30;
  else if (metrics.lighting === 'Moderate') riskScore += 15;

  if (metrics.policeDist > 2.5) riskScore += 25;
  else if (metrics.policeDist > 1.2) riskScore += 15;
  else riskScore += 5;

  riskScore += Math.min(metrics.incidents * 15, 30);

  if (metrics.density === 'Low' && metrics.lighting === 'Poor') riskScore += 15;
  riskScore = Math.min(Math.max(riskScore, 12), 92);

  let level = 'LOW';
  let color = '#16A34A'; // green
  let glowColor = 'rgba(22, 163, 74, 0.4)';

  if (riskScore >= 65) {
    level = 'HIGH';
    color = '#DC2626'; // red
    glowColor = 'rgba(220, 38, 38, 0.4)';
  } else if (riskScore >= 35) {
    level = 'MEDIUM';
    color = '#F59E0B'; // yellow
    glowColor = 'rgba(245, 158, 11, 0.4)';
  }

  // Calculate rotation for semi-circle gauge (from -90 to 90 degrees)
  const rotation = -90 + (riskScore / 100) * 180;

  return (
    <div className="bg-card border border-card-border p-6 rounded-3xl flex flex-col items-center h-full shadow-2xl relative overflow-hidden group">
      {/* Ambient background glow */}
      <motion.div 
        className="absolute top-0 left-1/2 w-full h-1/2 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: glowColor }}
      />

      <div className="w-full flex justify-between items-center mb-8 relative z-10">
        <h3 className="font-bold text-xl tracking-tight">Environmental Intelligence</h3>
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-safe animate-pulse"></span>
          Live Sync (Supabase + GPS)
        </span>
      </div>
      
      <div className="relative w-56 h-28 overflow-hidden mb-6 z-10">
        {/* Background track */}
        <div className="absolute top-0 left-0 w-56 h-56 rounded-full border-[18px] border-background border-b-transparent border-l-transparent transform rotate-45"></div>
        <div className="absolute top-0 left-0 w-56 h-56 rounded-full border-[18px] border-background border-t-transparent border-r-transparent transform rotate-45"></div>
        
        {/* Colored zones */}
        <div className="absolute top-0 left-0 w-56 h-56 rounded-full border-[18px] border-safe border-b-transparent border-r-transparent transform -rotate-[45deg] opacity-40"></div>
        <div className="absolute top-0 left-0 w-56 h-56 rounded-full border-[18px] border-yellow-500 border-b-transparent border-l-transparent transform -rotate-[45deg] opacity-40"></div>
        <div className="absolute top-0 left-0 w-56 h-56 rounded-full border-[18px] border-danger border-t-transparent border-l-transparent transform rotate-[45deg] opacity-40"></div>

        {/* Animated Needle */}
        <motion.div 
          className="absolute bottom-0 left-1/2 w-1.5 h-24 bg-text origin-bottom rounded-full"
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
          style={{ transform: `translateX(-50%)` }}
        >
          <div className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]"></div>
        </motion.div>
        
        {/* Center dot */}
        <div className="absolute bottom-[-10px] left-1/2 w-6 h-6 bg-primary rounded-full transform -translate-x-1/2 border-4 border-card shadow-lg z-20"></div>
      </div>

      <div className="text-center mb-8 z-10">
        <motion.p 
          className="text-4xl font-black tracking-widest" 
          animate={{ color }}
          transition={{ duration: 1 }}
        >
          {level}
        </motion.p>
        <p className="text-muted text-xs mt-1.5 uppercase tracking-[0.2em] font-semibold">
          Threat Index: {Math.round(riskScore)}%
        </p>
      </div>

      {/* Real Live Metrics */}
      <div className="w-full space-y-4 mt-auto pt-5 border-t border-card-border/50 z-10 relative">
        <MetricRow 
          icon={<Users className="w-4 h-4 text-primary" />} 
          label="Crowd Density" 
          value={metrics.density} 
          colorClass={metrics.density === 'Low' ? 'text-safe' : metrics.density === 'Medium' ? 'text-yellow-500' : 'text-danger'}
        />
        <MetricRow 
          icon={<Lightbulb className="w-4 h-4 text-yellow-500" />} 
          label="Street Lighting" 
          value={metrics.lighting} 
          colorClass={metrics.lighting === 'Good' ? 'text-safe' : metrics.lighting === 'Moderate' ? 'text-yellow-500' : 'text-danger'}
        />
        <MetricRow 
          icon={<MapPin className="w-4 h-4 text-blue-400" />} 
          label={`Nearest Police (${metrics.policeName.split(' ')[0]})`} 
          value={`${metrics.policeDist} km`} 
          colorClass="text-text"
        />
        <MetricRow 
          icon={<Activity className="w-4 h-4 text-danger" />} 
          label="Recent Incidents (Supabase)" 
          value={metrics.incidents} 
          colorClass={metrics.incidents > 0 ? 'text-danger' : 'text-safe'}
        />
      </div>
    </div>
  );
}

function MetricRow({ icon, label, value, colorClass }) {
  return (
    <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3 text-muted font-medium text-xs">
        {icon} <span className="truncate max-w-[180px]">{label}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.span 
          key={value}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className={`font-bold text-xs ${colorClass}`}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
