import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MapPin, Mic, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { fetchIncidents, subscribeToIncidents } from '../supabase/incidentsService';
import { mockAlertHistory } from '../mock/alertHistory';

export default function AlertFeed() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchIncidents();
      if (data && Array.isArray(data)) {
        setIncidents(data);
      }
      setLoading(false);
    };

    load();
    const unsub = subscribeToIncidents(() => load());
    const interval = setInterval(load, 5000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const displayList = incidents.length > 0 
    ? incidents.map(inc => ({
        id: inc.id,
        type: inc.title.includes('SOS') ? 'SOS' : 'Hazard Report',
        title: inc.title,
        description: inc.description,
        time: inc.created_at ? new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        location: inc.latitude && inc.longitude ? `${Number(inc.latitude).toFixed(4)}° N, ${Number(inc.longitude).toFixed(4)}° E` : 'Mysuru Area',
        status: inc.status,
        isLiveDb: true
      }))
    : mockAlertHistory.map((m, idx) => ({ ...m, id: `mock-${idx}`, isLiveDb: false }));

  const getIcon = (type) => {
    switch (type) {
      case 'SOS': return <AlertCircle className="w-5 h-5 text-danger" />;
      case 'Voice Trigger': return <Mic className="w-5 h-5 text-danger" />;
      case 'Danger Zone': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <MapPin className="w-5 h-5 text-primary" />;
    }
  };

  const getColorClass = (type, status) => {
    if (status === 'resolved') return 'border-safe/30 bg-safe/10';
    if (type === 'SOS') return 'border-danger/30 bg-danger/10';
    return 'border-primary/30 bg-primary/10';
  };

  return (
    <div className="bg-card border border-card-border rounded-xl flex flex-col h-full max-h-[500px]">
      <div className="p-4 border-b border-card-border flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-danger" /> Live Activity Feed
        </h3>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse"></span>
          Supabase Sync
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {displayList.map((alert, idx) => (
            <motion.div 
              key={alert.id || idx}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-3 rounded-xl border flex gap-3 ${getColorClass(alert.type, alert.status)}`}
            >
              <div className="mt-0.5">{getIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs truncate text-text">{alert.title || alert.type}</h4>
                  <span className="text-[10px] text-muted shrink-0 font-mono flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {alert.time}
                  </span>
                </div>
                {alert.description && (
                  <p className="text-[11px] text-muted mt-0.5 line-clamp-2">{alert.description}</p>
                )}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-card-border/40 text-[10px]">
                  <span className="text-muted flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-primary shrink-0" /> {alert.location}
                  </span>
                  {alert.status && (
                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${alert.status === 'active' ? 'bg-danger/20 text-danger' : 'bg-safe/20 text-safe'}`}>
                      {alert.status}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
