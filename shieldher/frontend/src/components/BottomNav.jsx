import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Activity, Map as MapIcon, Cpu, Zap } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { to: '/user/emergency', icon: <ShieldAlert className="w-5 h-5" />, label: 'SOS' },
    { to: '/user/risk', icon: <Activity className="w-5 h-5" />, label: 'Risk' },
    { to: '/user/map', icon: <MapIcon className="w-5 h-5" />, label: 'Map' },
    { to: '/user/device', icon: <Cpu className="w-5 h-5" />, label: 'Device' },
    { to: '/user/actions', icon: <Zap className="w-5 h-5" />, label: 'Actions' },
  ];

  return (
    <div className="fixed bottom-3 inset-x-0 mx-auto max-w-md px-3 z-40 pointer-events-none">
      <div className="pointer-events-auto bg-zinc-950/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] flex justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 relative ${
                isActive 
                  ? 'text-white bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.35)]' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(168,85,247,0.9)] text-purple-300' : ''} transition-transform`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-bold mt-1 tracking-wide ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,1)]"></span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
