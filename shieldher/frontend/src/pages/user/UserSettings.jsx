import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { UserPlus, Shield, Mic, Bell, Settings as SettingsIcon, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserSettings() {
  const [mockAction, setMockAction] = useState(null);

  const triggerMockAction = (name) => {
    setMockAction(name);
    setTimeout(() => {
      setMockAction(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <Navbar />

      <AnimatePresence>
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
              <p className="text-xs text-muted">Action simulated (Mock Mode)</p>
            </div>
            <button onClick={() => setMockAction(null)} className="ml-auto"><XCircle className="w-5 h-5 text-muted hover:text-text"/></button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="flex-1 p-6 max-w-lg mx-auto w-full space-y-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" /> Settings
        </h1>

        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-card-border">
            <h3 className="font-semibold text-lg flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" /> Trusted Circle</h3>
          </div>
          <div className="p-4">
            <button onClick={() => triggerMockAction('Add Guardian Menu')} className="w-full py-2 bg-background border border-dashed border-card-border text-muted rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" /> Add Guardian
            </button>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-card-border">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Device Pairing</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center bg-background p-3 rounded-lg border border-card-border">
              <div>
                <p className="font-medium">SH-001</p>
                <p className="text-xs text-safe">Connected</p>
              </div>
              <button onClick={() => triggerMockAction('Device Unpaired')} className="text-xs text-danger border border-danger/30 px-3 py-1 rounded hover:bg-danger/10">Unpair</button>
            </div>
            <button onClick={() => triggerMockAction('Bluetooth Scan Started')} className="w-full py-2 bg-background border border-dashed border-card-border text-muted rounded-lg hover:border-primary hover:text-primary transition-colors">
              Pair New Device
            </button>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-card-border">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Mic className="w-5 h-5 text-primary" /> Voice Activation</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm text-muted mb-1 block">Trigger Keyword</label>
              <input type="text" defaultValue="Help" className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-text" onChange={() => triggerMockAction('Settings Saved')} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl overflow-hidden mb-8">
          <div className="p-4 border-b border-card-border">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Bell className="w-5 h-5 text-primary" /> Notifications</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SMS Alerts</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" onChange={() => triggerMockAction('Settings Saved')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">In-app Alerts</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" onChange={() => triggerMockAction('Settings Saved')} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
