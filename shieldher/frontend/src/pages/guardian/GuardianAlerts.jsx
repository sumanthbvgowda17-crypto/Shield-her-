import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import MapView from '../../components/MapView';
import { AlertCircle, MapPin, Phone, MessageSquare, ShieldCheck, Activity } from 'lucide-react';
import { mockAlertHistory } from '../../mock/alertHistory';
import { mockUserData } from '../../mock/userData';

export default function GuardianAlerts() {
  const [activeSOS, setActiveSOS] = useState(false);
  const [liveAlert, setLiveAlert] = useState(null);

  React.useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/sos/active');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const active = data.find(a => a.status === 'active');
          if (active) {
            setActiveSOS(true);
            setLiveAlert(active);
          } else {
            setActiveSOS(false);
          }
        } else {
          setActiveSOS(false);
        }
      } catch (e) {
        // fallback
      }
    };

    fetchActive();
    const interval = setInterval(fetchActive, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${activeSOS ? 'bg-danger/20' : ''}`}>
      <Navbar />

      {activeSOS && (
        <div className="bg-danger text-white p-4 flex items-center justify-center gap-3 animate-pulse shadow-lg sticky top-[72px] z-40">
          <AlertCircle className="w-6 h-6" />
          <span className="font-bold text-lg">EMERGENCY SOS TRIGGERED</span>
        </div>
      )}

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className={`bg-card border ${activeSOS ? 'border-danger' : 'border-card-border'} rounded-xl overflow-hidden shadow-2xl`}>
            <div className={`p-4 border-b ${activeSOS ? 'border-danger bg-danger/10 text-danger' : 'border-card-border bg-background/50'}`}>
              <h2 className="font-bold text-xl flex items-center gap-2">
                <AlertCircle className="w-6 h-6" /> Active Alert Details
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between border-b border-card-border pb-4">
                <div>
                  <p className="text-muted text-sm">Subject</p>
                  <p className="font-bold text-lg">{mockUserData.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted text-sm">Time</p>
                  <p className="font-bold text-lg">{activeSOS ? new Date().toLocaleTimeString() : mockAlertHistory[0].time}</p>
                </div>
              </div>

              <div>
                <p className="text-muted text-sm mb-1">Source</p>
                <span className="inline-block px-3 py-1 bg-background border border-card-border rounded-lg font-mono text-sm">
                  {activeSOS ? 'Hardware Button (SH-001)' : mockAlertHistory[0].source || 'System'}
                </span>
              </div>

              <div>
                <p className="text-muted text-sm mb-1">Location</p>
                <p className="flex items-start gap-2 font-medium">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  {mockUserData.location.address}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button className="flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors">
                  <Activity className="w-5 h-5" /> I'm on my way
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-danger hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                  <Phone className="w-5 h-5" /> Call Police
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-background border border-card-border hover:border-primary rounded-lg font-medium transition-colors">
                  <MessageSquare className="w-5 h-5 text-primary" /> Msg Manya
                </button>
                <button 
                  onClick={() => setActiveSOS(false)}
                  className="flex items-center justify-center gap-2 py-3 bg-safe/10 text-safe border border-safe/30 hover:bg-safe/20 rounded-lg font-medium transition-colors"
                >
                  <ShieldCheck className="w-5 h-5" /> Mark Safe
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setActiveSOS(true)}
            className="w-full py-4 border-2 border-dashed border-danger/50 text-danger/70 hover:bg-danger/10 hover:border-danger hover:text-danger rounded-xl font-mono text-sm transition-colors"
          >
            [DEMO] Simulate Hardware Button Press
          </button>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className={`h-[300px] rounded-xl overflow-hidden border ${activeSOS ? 'border-danger shadow-[0_0_30px_rgba(220,38,38,0.3)]' : 'border-card-border'}`}>
            <MapView 
              center={[mockUserData.location.lat, mockUserData.location.lng]} 
              zoom={activeSOS ? 17 : 14} 
              height="100%" 
            />
          </div>

          <div className="bg-card border border-card-border rounded-xl p-4">
            <h3 className="font-semibold text-lg mb-4">Past 24 Hours</h3>
            <div className="space-y-3">
              {mockAlertHistory.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-background border border-card-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`w-5 h-5 ${alert.type === 'SOS' ? 'text-danger' : alert.type === 'Danger Zone' ? 'text-yellow-500' : 'text-primary'}`} />
                    <div>
                      <p className="font-medium text-sm">{alert.type}</p>
                      <p className="text-xs text-muted">{alert.location}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted font-mono">{alert.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
