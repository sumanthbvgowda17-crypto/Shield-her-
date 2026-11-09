import React, { useState, useEffect } from 'react';
import { Battery, BatteryMedium, BatteryLow, Signal, Wifi, Clock, Navigation, Thermometer, Activity, PowerOff, ShieldCheck, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeviceStatusCard() {
  const [timer, setTimer] = useState(0);
  const [isPinging, setIsPinging] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  // Fluctuating Mock Data
  const [battery, setBattery] = useState(78);
  const [signal, setSignal] = useState(3);
  const [accuracy, setAccuracy] = useState(4.2);
  const [temp, setTemp] = useState(34.0);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setTimer(prev => (prev + 1) % 5);
    }, 1000);
    
    const dataInterval = setInterval(() => {
      setSignal(Math.random() > 0.8 ? 4 : Math.random() > 0.3 ? 3 : 2);
      setAccuracy(prev => +(Math.max(1.5, prev + (Math.random() * 0.8 - 0.4))).toFixed(1));
      setTemp(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1));
      if (Math.random() > 0.95) setBattery(prev => Math.max(0, prev - 1));
    }, 2500);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dataInterval);
    };
  }, []);

  const getBatteryIcon = (level) => {
    if (level > 60) return <Battery className="text-safe w-6 h-6 animate-pulse" />;
    if (level > 20) return <BatteryMedium className="text-yellow-500 w-6 h-6 animate-pulse" />;
    return <BatteryLow className="text-danger w-6 h-6 animate-ping" />;
  };

  const handlePing = () => {
    setIsPinging(true);
    setTimeout(() => setIsPinging(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="bg-card border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(124,58,237,0.1)] relative overflow-hidden group"
    >
      {/* Background animated glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-16 -top-16 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-16 -bottom-16 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none"
      />

      <div className="flex items-start justify-between mb-8 relative z-10">
        <div>
          <h3 className="font-black text-xl flex items-center gap-2 tracking-tight text-white">
            <Cpu className="w-5 h-5 text-primary" />
            ShieldHer Core
          </h3>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer text-[10px] font-mono text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/30 mt-2 inline-flex items-center gap-1 shadow-[0_0_10px_rgba(124,58,237,0.2)]"
          >
            <span>ID: SH-001</span>
            <ShieldCheck className="w-3 h-3" />
          </motion.div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-safe/10 text-safe px-3 py-1.5 rounded-full text-xs font-black tracking-widest border border-safe/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] cursor-pointer"
          >
            <div className={`w-2 h-2 rounded-full bg-safe ${isPinging ? 'animate-ping' : 'animate-pulse'}`}></div>
            {isPinging ? 'PINGING' : 'ONLINE'}
          </motion.div>
          <span className="text-[10px] text-muted font-mono tracking-wider font-semibold">SYNC: {timer}S AGO</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        <MetricBox 
          icon={getBatteryIcon(battery)} 
          label="Battery Power" 
          value={`${battery}%`} 
          color={battery > 20 ? 'text-white' : 'text-danger'}
        />
        <MetricBox 
          icon={<Signal className="text-primary w-6 h-6" />} 
          label="Cellular Signal" 
          value={`${signal}/4`} 
          subtext="4G LTE" 
        />
        <MetricBox 
          icon={<Navigation className="text-blue-400 w-6 h-6" />} 
          label="GPS Accuracy" 
          value={`± ${accuracy}m`} 
        />
        <MetricBox 
          icon={<Thermometer className="text-yellow-500 w-6 h-6" />} 
          label="Core Temp" 
          value={`${temp}°C`} 
        />
      </div>

      {/* Advanced Device Controls */}
      <div className="flex gap-3 relative z-10">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePing}
          className={`flex-[2] py-3.5 rounded-2xl text-xs font-black tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${
            isPinging 
              ? 'bg-primary text-white shadow-[0_0_20px_rgba(124,58,237,0.5)]' 
              : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'
          }`}
        >
          <Activity className={`w-5 h-5 ${isPinging ? 'animate-spin' : ''}`} /> 
          {isPinging ? 'LOCATING...' : 'PING DEVICE'}
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className={`flex-1 border py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center shadow-md ${
            showDiagnostics ? 'bg-white/10 text-white border-white/30' : 'bg-background border-white/5 hover:border-white/20 text-muted hover:text-white'
          }`}
        >
          DIAGNOSTICS
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          whileTap={{ scale: 0.9 }}
          className="w-14 bg-background border border-white/5 hover:border-danger/50 text-muted hover:text-danger py-3.5 rounded-2xl flex items-center justify-center transition-colors shadow-md"
        >
          <PowerOff className="w-5 h-5" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showDiagnostics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 mt-4 bg-black/40 rounded-2xl p-4 border border-white/5"
          >
            <p className="text-[10px] text-primary font-mono mb-2 uppercase tracking-widest">Running System Check...</p>
            <div className="space-y-2 font-mono text-[10px] text-muted">
              <div className="flex justify-between"><span className="text-white">IMU Sensor</span> <span className="text-safe">OK</span></div>
              <div className="flex justify-between"><span className="text-white">Audio Mic</span> <span className="text-safe">OK</span></div>
              <div className="flex justify-between"><span className="text-white">Bluetooth LE</span> <span className="text-safe">OK</span></div>
              <div className="flex justify-between"><span className="text-white">Firmware</span> <span>v2.1.4</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MetricBox({ icon, label, value, subtext, color = "text-white" }) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-black/20 backdrop-blur-md border border-white/5 hover:border-white/20 p-4 rounded-2xl flex flex-col gap-3 transition-colors cursor-pointer group shadow-lg"
    >
      <div className="flex justify-between items-start">
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          {icon}
        </motion.div>
      </div>
      <div>
        <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-1 group-hover:text-primary/80 transition-colors">{label}</p>
        <AnimatePresence mode="wait">
          <motion.p 
            key={value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`font-black text-2xl tracking-tight ${color}`}
          >
            {value} {subtext && <span className="text-[10px] font-bold text-muted ml-1 tracking-widest">{subtext}</span>}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
