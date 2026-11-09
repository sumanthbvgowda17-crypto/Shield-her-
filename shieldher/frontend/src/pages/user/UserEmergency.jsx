import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import GuardianStatusBar from '../../components/GuardianStatusBar';
import SOSButton from '../../components/SOSButton';
import { useSOSTrigger } from '../../hooks/useSOSTrigger';
import { useVoiceActivation } from '../../hooks/useVoiceActivation';
import { Mic, MicOff, CheckCircle, Navigation, Camera, Activity as ActivityIcon, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SensorModal from '../../components/SensorModal';

export default function UserEmergency() {
  const { isSOSActive, sosLogs, triggerSOS, resolveSOS } = useSOSTrigger();

  const handleTranscript = useCallback(async (text) => {
    if (!text || text.trim() === '') return;
    try {
      await fetch('http://localhost:5001/api/sos/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: 'user-phone-123', text })
      });
    } catch(e) {
      console.error("Failed to send audio transcript", e);
    }
  }, []);

  const { isListening, toggleListening, supported } = useVoiceActivation(triggerSOS, handleTranscript);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [fallDetection, setFallDetection] = useState(true);
  const [emergencyType, setEmergencyType] = useState('');
  const [selectedSensor, setSelectedSensor] = useState(null);

  const handleEmergencyTypeChange = async (e) => {
    const type = e.target.value;
    setEmergencyType(type);
    if (type) {
      try {
        await fetch('http://localhost:5001/api/sos/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_id: 'user-phone-123', type })
        });
      } catch (err) {
        console.error("Failed to update SOS type", err);
      }
    }
  };

  const handleSimulateShake = () => {
    if (fallDetection) {
      triggerSOS();
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-1000 ${isSOSActive ? 'bg-danger/25' : 'bg-background'}`}>
      <Navbar />
      <GuardianStatusBar />

      {/* Emergency Active Overlay */}
      <AnimatePresence>
        {isSOSActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-zinc-950/90 border border-danger/60 rounded-3xl p-6 shadow-[0_25px_80px_rgba(244,63,94,0.4)] relative overflow-hidden">
              <motion.div
                animate={{ opacity: [0.15, 0.4, 0.15] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute inset-0 bg-danger/20 pointer-events-none"
              />

              <h2 className="relative z-10 text-danger font-black text-2xl text-center mb-6 flex items-center justify-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-danger custom-pulse shadow-[0_0_15px_rgba(244,63,94,1)]"></span>
                EMERGENCY SOS BROADCAST ACTIVE
              </h2>

              <div className="relative z-10 mb-5">
                <label className="block text-xs font-bold text-zinc-400 mb-2 text-center uppercase tracking-wider">
                  Specify Emergency Type (Notifies Guardians):
                </label>
                <select
                  value={emergencyType}
                  onChange={handleEmergencyTypeChange}
                  className="w-full bg-zinc-900 border-2 border-danger/50 text-white rounded-2xl p-3 focus:outline-none focus:border-danger transition-colors font-bold text-center appearance-none text-sm"
                >
                  <option value="" disabled>Select Type...</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Police Intervention">Police Intervention Needed</option>
                  <option value="Fire Hazard">Fire Hazard</option>
                  <option value="Feeling Unsafe / Stalked">Feeling Unsafe / Stalked</option>
                  <option value="Accident / Breakdown">Accident / Vehicle Breakdown</option>
                </select>
              </div>

              <div className="relative z-10 h-60 overflow-y-auto space-y-2.5 mb-5 p-4 bg-black/50 rounded-2xl border border-white/10">
                {sosLogs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2.5 bg-zinc-900/80 p-3 rounded-xl border border-white/10 text-xs"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-zinc-100">{log.message}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{log.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button 
                onClick={resolveSOS}
                className="relative z-10 w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer text-sm"
              >
                MARK SAFE & RESOLVE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col justify-start pb-24 gap-5">
        
        {/* Massive 3D Glassy Panic SOS Section */}
        <section className="glass-card-3d rounded-3xl p-8 relative overflow-hidden flex flex-col items-center min-h-[380px] justify-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
          
          <div className="absolute top-5 left-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
            <span className="font-bold text-[10px] tracking-widest uppercase text-zinc-400">Autonomous Defense Hub</span>
          </div>

          <div className="flex justify-center mt-6 scale-[1.35] drop-shadow-[0_15px_30px_rgba(244,63,94,0.45)]">
            <SOSButton size="large" onTrigger={triggerSOS} />
          </div>
        </section>

        {/* 4-Sensor Array Glassy Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          
          {/* GPS Sensor */}
          <div 
            onClick={() => setSelectedSensor('gps')}
            className="glass-card-3d p-4 rounded-2xl relative overflow-hidden cursor-pointer group hover:border-blue-500/50"
          >
            <div className="flex justify-between items-start mb-2.5">
              <Navigation className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 custom-pulse"></span>
                <span className="text-[9px] text-emerald-400 font-bold">LOCKED</span>
              </div>
            </div>
            <h3 className="font-bold text-xs text-white">GPS Sensor</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Live coordinates synced</p>
            <div className="mt-2.5 bg-black/40 border border-white/10 rounded-xl p-1.5 text-center font-mono text-[9px] text-zinc-300">
              12.2958° N, 76.6394° E
            </div>
          </div>

          {/* Microphone Sensor */}
          <div 
            onClick={() => setSelectedSensor('mic')}
            className={`glass-card-3d p-4 rounded-2xl relative overflow-hidden cursor-pointer group ${isListening ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'hover:border-purple-500/50'}`}
          >
            <div className="flex justify-between items-start mb-2.5">
              {isListening ? <Mic className="w-5 h-5 text-purple-400 animate-pulse group-hover:scale-110 transition-transform" /> : <MicOff className="w-5 h-5 text-zinc-500 group-hover:scale-110 transition-transform" />}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleListening(); }}
                className={`w-9 h-4.5 rounded-full relative transition-colors ${isListening ? 'bg-purple-600' : 'bg-zinc-800'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${isListening ? 'left-5' : 'left-0.5'}`}></div>
              </button>
            </div>
            <h3 className="font-bold text-xs text-white">Mic Sensor</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">"Help me" detection</p>
            
            <div className="mt-3 flex items-end justify-center gap-1 h-5">
              {[1,2,3,4,5,6].map((i) => (
                <motion.div 
                  key={i}
                  animate={{ height: isListening ? ['20%', '80%', '40%', '100%', '20%'] : '15%' }}
                  transition={{ duration: Math.random() * 0.4 + 0.4, repeat: Infinity }}
                  className={`w-1 rounded-t-full ${isListening ? 'bg-purple-400' : 'bg-zinc-700'}`}
                />
              ))}
            </div>
          </div>

          {/* Camera Sensor */}
          <div 
            onClick={() => setSelectedSensor('camera')}
            className={`glass-card-3d p-4 rounded-2xl relative overflow-hidden cursor-pointer group ${cameraActive ? 'border-danger shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'hover:border-danger/50'}`}
          >
            <div className="flex justify-between items-start mb-2.5">
              <Camera className={`w-5 h-5 transition-transform group-hover:scale-110 ${cameraActive ? 'text-danger' : 'text-zinc-500'}`} />
              <button 
                onClick={(e) => { e.stopPropagation(); setCameraActive(!cameraActive); }}
                className={`w-9 h-4.5 rounded-full relative transition-colors ${cameraActive ? 'bg-danger' : 'bg-zinc-800'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${cameraActive ? 'left-5' : 'left-0.5'}`}></div>
              </button>
            </div>
            <h3 className="font-bold text-xs text-white">Camera Sensor</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Auto-record evidence</p>
            <div className={`mt-2.5 py-1 rounded-xl text-center text-[9px] font-bold ${cameraActive ? 'bg-danger/20 text-danger border border-danger/40 animate-pulse' : 'bg-black/40 text-zinc-500 border border-white/5'}`}>
              {cameraActive ? '🔴 STANDBY FOR SOS' : 'DISABLED'}
            </div>
          </div>

          {/* Motion Sensor */}
          <div 
            onClick={() => setSelectedSensor('motion')}
            className={`glass-card-3d p-4 rounded-2xl relative overflow-hidden cursor-pointer group ${fallDetection ? 'border-amber-500/50' : 'hover:border-amber-500/50'}`}
          >
            <div className="flex justify-between items-start mb-2.5">
              <ActivityIcon className={`w-5 h-5 transition-transform group-hover:scale-110 ${fallDetection ? 'text-amber-400' : 'text-zinc-500'}`} />
              <button 
                onClick={(e) => { e.stopPropagation(); setFallDetection(!fallDetection); }}
                className={`w-9 h-4.5 rounded-full relative transition-colors ${fallDetection ? 'bg-amber-500' : 'bg-zinc-800'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${fallDetection ? 'left-5' : 'left-0.5'}`}></div>
              </button>
            </div>
            <h3 className="font-bold text-xs text-white">Motion Sensor</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Fall / Shake trigger</p>
            <button 
              onClick={(e) => { e.stopPropagation(); handleSimulateShake(); }}
              disabled={!fallDetection}
              className={`mt-2.5 w-full py-1 rounded-xl text-[9px] font-bold border transition-colors ${fallDetection ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-white' : 'bg-black/40 text-zinc-600 border-white/5 opacity-50'}`}
            >
              SIMULATE SHAKE
            </button>
          </div>

        </div>
      </main>

      <BottomNav />
      <SensorModal sensor={selectedSensor} onClose={() => setSelectedSensor(null)} />
    </div>
  );
}
