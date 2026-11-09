import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, Mic, Camera, Activity, ShieldAlert, Cpu } from 'lucide-react';

export default function SensorModal({ sensor, onClose }) {
  if (!sensor) return null;

  const [dataPoints, setDataPoints] = useState([]);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (sensor === 'camera') {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => console.error("Camera access denied or unavailable:", err));
    }

    return () => {
      // Cleanup stream when modal closes or sensor changes
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [sensor]); // Don't add stream as dependency to avoid loop

  const handleCapturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    
    try {
      await fetch('http://localhost:5001/api/sos/camera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: 'user-phone-123', image: base64Image })
      });
    } catch(err) {
      console.error("Failed to upload photo", err);
    }
    
    setTimeout(() => setIsCapturing(false), 500); // Reset flash effect
  };

  useEffect(() => {
    // Generate some initial random data for graphs
    setDataPoints(Array.from({ length: 20 }, () => Math.random() * 100));
    
    // Simulate live data updates
    const interval = setInterval(() => {
      setDataPoints(prev => {
        const newData = [...prev.slice(1), Math.random() * 100];
        return newData;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const renderSensorContent = () => {
    switch (sensor) {
      case 'gps':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-card-border/30 p-3 rounded-lg">
              <span className="text-muted text-xs font-bold uppercase">Satellite Link</span>
              <span className="text-safe text-xs font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-safe custom-pulse"></span>ACTIVE (12 SAT)</span>
            </div>
            
            <div className="relative h-40 bg-card-border/10 rounded-xl overflow-hidden border border-card-border/50 flex items-center justify-center">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]"></div>
               {/* Radar animation */}
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 className="w-full h-full absolute inset-0 border-t-2 border-blue-500/50 rounded-full scale-[1.5]"
                 style={{ transformOrigin: "center center" }}
               />
               <Navigation className="w-8 h-8 text-blue-500 absolute" />
               <motion.div 
                 animate={{ opacity: [0, 1, 0], scale: [0.8, 1.5, 2] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute w-4 h-4 bg-blue-500/50 rounded-full"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background p-3 rounded-lg border border-card-border text-center">
                <div className="text-[10px] text-muted font-bold mb-1">LATITUDE</div>
                <div className="font-mono text-sm tracking-wider">{(12.2958 + (dataPoints[dataPoints.length-1]*0.00001)).toFixed(6)}° N</div>
              </div>
              <div className="bg-background p-3 rounded-lg border border-card-border text-center">
                <div className="text-[10px] text-muted font-bold mb-1">LONGITUDE</div>
                <div className="font-mono text-sm tracking-wider">{(76.6394 + (dataPoints[dataPoints.length-1]*0.00001)).toFixed(6)}° E</div>
              </div>
              <div className="bg-background p-3 rounded-lg border border-card-border text-center col-span-2">
                 <div className="text-[10px] text-muted font-bold mb-1">ACCURACY METRICS</div>
                 <div className="w-full bg-card-border/30 h-2 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500" 
                      animate={{ width: `${80 + (Math.random() * 15)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                 </div>
              </div>
            </div>
            
            <button 
              onClick={async () => {
                try {
                  await fetch('http://localhost:5001/api/sos/gps', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      device_id: 'user-phone-123', 
                      lat: (12.2958 + (dataPoints[dataPoints.length-1]*0.00001)).toFixed(6),
                      lng: (76.6394 + (dataPoints[dataPoints.length-1]*0.00001)).toFixed(6)
                    })
                  });
                } catch(err) { console.error(err); }
              }}
              className="w-full py-4 bg-blue-500/10 border border-blue-500/50 text-blue-500 font-black rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] flex items-center justify-center gap-2 mt-4"
            >
              <Navigation className="w-5 h-5" />
              SEND LOCATION UPDATE SMS
            </button>
          </div>
        );

      case 'mic':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-card-border/30 p-3 rounded-lg">
              <span className="text-muted text-xs font-bold uppercase">Input Gain</span>
              <span className="text-primary text-xs font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>MONITORING</span>
            </div>

            <div className="h-40 bg-card-border/10 rounded-xl border border-card-border/50 flex flex-col justify-end p-4 gap-1 relative overflow-hidden">
              <div className="absolute top-2 left-2 text-[10px] text-primary/50 font-mono tracking-widest">FREQ. ANALYSIS</div>
              <div className="flex items-end justify-between w-full h-full gap-1">
                {dataPoints.map((val, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: `${Math.max(10, val)}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-full rounded-t-sm ${val > 80 ? 'bg-danger' : val > 50 ? 'bg-primary' : 'bg-primary/40'}`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-background border border-card-border p-4 rounded-xl">
               <div className="text-xs font-bold text-muted mb-2">DB LEVEL</div>
               <div className="flex items-center gap-4">
                  <div className="text-3xl font-black text-primary w-16">
                    {Math.round(dataPoints[dataPoints.length - 1] || 0)}
                  </div>
                  <div className="flex-1">
                     <div className="w-full bg-card-border/30 h-3 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${dataPoints[dataPoints.length - 1] > 80 ? 'bg-danger' : 'bg-primary'}`}
                          animate={{ width: `${dataPoints[dataPoints.length - 1] || 0}%` }}
                          transition={{ type: "spring" }}
                        />
                     </div>
                  </div>
               </div>
               {dataPoints[dataPoints.length - 1] > 80 && (
                 <p className="text-[10px] text-danger mt-2 font-bold animate-pulse">⚠️ LOUD NOISE DETECTED</p>
               )}
            </div>
          </div>
        );

      case 'camera':
        return (
          <div className="space-y-6 relative">
            <div className="flex justify-between items-center bg-card-border/30 p-3 rounded-lg">
              <span className="text-muted text-xs font-bold uppercase">Live Hardware Feed</span>
              <span className="text-danger text-xs font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>ACTIVE</span>
            </div>

            <div className="relative h-64 bg-black rounded-xl border-2 border-card-border overflow-hidden flex items-center justify-center">
              {/* Flash effect when capturing */}
              <AnimatePresence>
                {isCapturing && (
                  <motion.div 
                    initial={{ opacity: 1 }} 
                    animate={{ opacity: 0 }} 
                    exit={{ opacity: 0 }} 
                    transition={{ duration: 0.5 }} 
                    className="absolute inset-0 bg-white z-50 pointer-events-none" 
                  />
                )}
              </AnimatePresence>

              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover z-0"
              />
              <canvas ref={canvasRef} className="hidden" />

              {!stream && (
                <div className="absolute flex flex-col items-center justify-center text-muted z-10">
                  <Camera className="w-12 h-12 mb-2 opacity-50 animate-pulse" />
                  <p className="text-xs font-bold">Requesting Access...</p>
                </div>
              )}
              
              <div className="absolute top-2 right-3 text-red-500 font-bold text-xs flex items-center gap-1 animate-pulse z-20 drop-shadow-md">
                ● REC
              </div>
              <div className="absolute bottom-2 left-3 text-white/70 font-mono text-[10px] z-20 drop-shadow-md">
                {new Date().toISOString()}
              </div>
            </div>

            <button 
              onClick={handleCapturePhoto}
              disabled={!stream || isCapturing}
              className="w-full py-4 bg-danger/10 border border-danger/50 text-danger font-black rounded-xl hover:bg-danger hover:text-white transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              CAPTURE PHOTO & SEND SMS
            </button>
          </div>
        );

      case 'motion':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-card-border/30 p-3 rounded-lg">
              <span className="text-muted text-xs font-bold uppercase">IMU Telemetry</span>
              <span className="text-yellow-500 text-xs font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>TRACKING</span>
            </div>

            <div className="h-40 bg-card-border/10 rounded-xl border border-card-border/50 p-4 relative overflow-hidden flex items-center">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <motion.polyline
                  points={dataPoints.map((val, i) => `${(i / (dataPoints.length - 1)) * 100},${100 - val}`).join(' ')}
                  fill="none"
                  stroke="var(--color-yellow-500, #eab308)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
            </div>

            <div className="grid grid-cols-3 gap-2">
               <div className="bg-background p-2 rounded-lg border border-card-border text-center">
                  <div className="text-[10px] text-muted font-bold">X-AXIS</div>
                  <div className="font-mono text-xs mt-1">{(Math.random() * 2 - 1).toFixed(2)}g</div>
               </div>
               <div className="bg-background p-2 rounded-lg border border-card-border text-center">
                  <div className="text-[10px] text-muted font-bold">Y-AXIS</div>
                  <div className="font-mono text-xs mt-1">{(Math.random() * 2 - 1).toFixed(2)}g</div>
               </div>
               <div className="bg-background p-2 rounded-lg border border-card-border text-center">
                  <div className="text-[10px] text-muted font-bold">Z-AXIS</div>
                  <div className="font-mono text-xs mt-1">{(Math.random() * 2 - 1 + 9.8).toFixed(2)}g</div>
               </div>
            </div>

            <button 
              onClick={async () => {
                try {
                  await fetch('http://localhost:5001/api/sos/motion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      device_id: 'user-phone-123', 
                      status: 'High Impact/Fall Detected'
                    })
                  });
                } catch(err) { console.error(err); }
              }}
              className="w-full py-4 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 font-black rounded-xl hover:bg-yellow-500 hover:text-white transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center justify-center gap-2 mt-4"
            >
              <Activity className="w-5 h-5" />
              SEND TELEMETRY SMS
            </button>
          </div>
        );
      
      default: return null;
    }
  };

  const titles = {
    gps: 'GPS & Location Array',
    mic: 'Acoustic Monitoring',
    camera: 'Visual Evidence Feed',
    motion: 'Inertial Motion Unit'
  };

  const icons = {
    gps: <Navigation className="w-5 h-5 text-blue-500" />,
    mic: <Mic className="w-5 h-5 text-primary" />,
    camera: <Camera className="w-5 h-5 text-danger" />,
    motion: <Activity className="w-5 h-5 text-yellow-500" />
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card w-full max-w-md rounded-2xl border border-card-border shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-card-border flex justify-between items-center bg-background/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-card-border/30 rounded-lg">
                {icons[sensor]}
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide">{titles[sensor]}</h3>
                <p className="text-[10px] text-muted font-mono flex items-center gap-1"><Cpu className="w-3 h-3" /> Hardware Direct Access</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-card-border/20 rounded-full hover:bg-card-border/50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            {renderSensorContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
