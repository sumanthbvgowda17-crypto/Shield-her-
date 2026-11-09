import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import { Share2, Phone, Map, Mic, Volume2, Video, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReportIncidentModal from '../../components/ReportIncidentModal';

export default function UserActions() {
  const [fakeCall, setFakeCall] = useState(false);
  const [mockAction, setMockAction] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [userCoords, setUserCoords] = useState([12.2958, 76.6394]);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  const triggerMockAction = (name) => {
    setMockAction(name);
    setTimeout(() => {
      setMockAction(null);
    }, 3000);
  };

  const handleShareLocation = async () => {
    triggerMockAction('Locating & Sending SMS...');
    
    let lat = userCoords[0];
    let lng = userCoords[1];

    const sendLocation = async (latitude, longitude) => {
      try {
        const res = await fetch('http://localhost:5001/api/actions/share-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: latitude, lng: longitude })
        });
        const data = await res.json();
        if (data.success) {
          triggerMockAction('Location SMS Sent to Guardian!');
        } else {
          triggerMockAction('Failed to send SMS');
        }
      } catch(e) {
        triggerMockAction('Error sending SMS');
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          console.warn('Geolocation fallback:', err.message);
          sendLocation(lat, lng);
        },
        { enableHighAccuracy: true, timeout: 4000 }
      );
    } else {
      sendLocation(lat, lng);
    }
  };

  const handleFakeCall = async () => {
    setFakeCall(true);
    try {
      await fetch('http://localhost:5001/api/actions/call', {
        method: 'POST'
      });
    } catch(e) {
      console.error('Failed to trigger Twilio Call');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <AnimatePresence>
        {fakeCall && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between py-16"
          >
            <div className="text-center">
              <h2 className="text-3xl text-white mb-2">Dad Calling...</h2>
              <p className="text-muted">Mobile</p>
            </div>
            <div className="w-32 h-32 rounded-full bg-card-border mb-16 flex items-center justify-center text-4xl font-bold">Dad</div>
            <div className="flex gap-16">
              <button onClick={() => setFakeCall(false)} className="w-16 h-16 rounded-full bg-danger flex items-center justify-center text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]"><Phone className="rotate-135" /></button>
              <button onClick={() => setFakeCall(false)} className="w-16 h-16 rounded-full bg-safe flex items-center justify-center text-white shadow-[0_0_20px_rgba(22,163,74,0.5)]"><Phone /></button>
            </div>
          </motion.div>
        )}

        {mockAction && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-card border border-primary text-text px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(107,33,168,0.3)] flex items-center gap-4 w-11/12 max-w-sm"
          >
            <div className="w-3 h-3 rounded-full bg-primary animate-ping"></div>
            <div>
              <p className="font-bold text-primary text-sm uppercase tracking-wider">{mockAction}</p>
              <p className="text-xs text-muted">System Status</p>
            </div>
            <button onClick={() => setMockAction(null)} className="ml-auto"><XCircle className="w-5 h-5 text-muted hover:text-text"/></button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col pb-24">
        <h1 className="text-2xl font-bold mb-6">Tactical Actions</h1>

        {/* Primary Highlight Action: Report Incident to Supabase */}
        <button
          onClick={() => setReportModalOpen(true)}
          className="w-full mb-4 p-4 rounded-2xl bg-danger/10 border-2 border-danger/40 hover:border-danger hover:bg-danger/20 transition-all flex items-center justify-between text-left group shadow-lg"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-danger text-white group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-text">Report Safety Incident</h3>
              <p className="text-xs text-muted">Log real incident coordinates to Supabase vault</p>
            </div>
          </div>
          <span className="text-xs font-bold text-danger bg-danger/10 px-2.5 py-1 rounded-lg">
            REPORT
          </span>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <ActionButton icon={<Share2 className="w-8 h-8" />} label="Share Location" desc="Send live tracking link" onClick={handleShareLocation} />
          <ActionButton icon={<Phone className="w-8 h-8" />} label="Fake Call" desc="Simulate incoming call" onClick={handleFakeCall} />
          <ActionButton icon={<Map className="w-8 h-8" />} label="Safe Route" desc="Navigate to safe zone" onClick={() => triggerMockAction('Safe Routing')} />
          <ActionButton icon={<Video className="w-8 h-8" />} label="Stream Video" desc="Broadcast to guardians" danger onClick={() => triggerMockAction('Video Broadcast')} />
          <ActionButton icon={<Mic className="w-8 h-8" />} label="Record Audio" desc="Stealth recording" danger onClick={() => triggerMockAction('Stealth Recording')} />
          <ActionButton icon={<Volume2 className="w-8 h-8" />} label="Siren" desc="Play loud alarm" danger onClick={() => triggerMockAction('Loud Siren')} />
        </div>
      </main>

      <BottomNav />

      <ReportIncidentModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        userCoords={userCoords}
      />
    </div>
  );
}

function ActionButton({ icon, label, desc, onClick, danger }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-6 bg-card border rounded-2xl transition-colors gap-3 ${
        danger 
          ? 'border-card-border hover:border-danger hover:bg-danger/5 text-muted hover:text-danger' 
          : 'border-card-border hover:border-primary hover:bg-primary/5 text-muted hover:text-primary'
      }`}
    >
      <div className={danger ? 'text-danger' : 'text-primary'}>{icon}</div>
      <div className="text-center">
        <span className="text-sm font-bold block">{label}</span>
        <span className="text-[10px] text-muted">{desc}</span>
      </div>
    </button>
  );
}
