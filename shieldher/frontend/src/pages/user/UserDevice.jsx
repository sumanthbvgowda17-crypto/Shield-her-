import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import DeviceStatusCard from '../../components/DeviceStatusCard';
import { motion } from 'framer-motion';

export default function UserDevice() {
  const [powerSaving, setPowerSaving] = useState(false);
  const [autoConnect, setAutoConnect] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col pb-24">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-black mb-6 tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent"
        >
          Hardware Status
        </motion.h1>
        
        <DeviceStatusCard />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 space-y-4"
        >
          <h3 className="font-bold text-muted uppercase text-[10px] tracking-[0.2em] ml-2 mb-2 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-card-border"></span>
            Device Configuration
            <span className="flex-1 h-[1px] bg-card-border"></span>
          </h3>
          
          <SettingToggle 
            title="Power Saving Mode"
            description="Reduces ping rate and limits GPS accuracy to save battery"
            isOn={powerSaving}
            onToggle={() => setPowerSaving(!powerSaving)}
          />

          <SettingToggle 
            title="Auto-Connect WiFi"
            description="Use known networks for ultra-precise indoor location"
            isOn={autoConnect}
            onToggle={() => setAutoConnect(!autoConnect)}
          />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}

function SettingToggle({ title, description, isOn, onToggle }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`cursor-pointer rounded-2xl p-5 flex justify-between items-center transition-all border shadow-lg ${
        isOn 
          ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(124,58,237,0.1)]' 
          : 'bg-card border-white/5 hover:border-white/20'
      }`}
    >
      <div className="pr-4">
        <p className={`font-bold transition-colors ${isOn ? 'text-primary' : 'text-white'}`}>{title}</p>
        <p className="text-[10px] text-muted mt-1 leading-relaxed">{description}</p>
      </div>
      
      <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isOn ? 'bg-primary' : 'bg-card-border/50'}`}>
        <motion.div 
          className="bg-white w-4 h-4 rounded-full shadow-sm"
          animate={{ x: isOn ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </motion.div>
  );
}
