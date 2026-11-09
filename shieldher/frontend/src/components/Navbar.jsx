import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Shield, Settings, LogOut, User, Sun, Moon, MapPin, Mail, Phone, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between px-5 py-3.5 bg-zinc-950/70 border-b border-white/10 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Brand with 3D glowing shield */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 shadow-[0_0_20px_rgba(168,85,247,0.7)] p-0.5">
          <Shield className="text-white w-5 h-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
        </div>
        <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-400 bg-clip-text text-transparent hidden sm:inline">
          {currentUser?.role === 'guardian' ? 'ShieldHer Guardian' : 'ShieldHer'}
        </span>
      </div>

      <div className="flex items-center gap-3.5 relative">
        {currentUser?.role === 'guardian' && (
          <div className="bg-purple-500/15 text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Watching: Prajwal
          </div>
        )}

        {/* User Account Capsule */}
        <div 
          className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 cursor-pointer transition-all shadow-inner active:scale-95"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {currentUser?.avatar_url ? (
            <img 
              src={currentUser.avatar_url} 
              alt={currentUser.name || 'User'} 
              className="w-7 h-7 rounded-full object-cover border border-purple-400/40 shadow-sm"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <User className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-bold hidden sm:inline text-zinc-200">
            {currentUser?.name?.split(' ')[0] || 'Account'}
          </span>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute top-14 right-4 w-64 bg-zinc-950/90 border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden z-50"
            >
              <div className="p-4 border-b border-white/10 bg-gradient-to-b from-purple-900/30 to-transparent">
                <p className="font-bold text-sm text-white truncate">{currentUser?.name || 'User'}</p>
                <p className="text-[11px] text-purple-300 font-medium capitalize mt-0.5">{currentUser?.role || 'User'} Safety Profile</p>
              </div>
              <div className="p-4 space-y-2.5">
                {currentUser?.email && (
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-purple-400" /> 
                    <span className="truncate">{currentUser.email}</span>
                  </div>
                )}
                {currentUser?.phone && (
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-purple-400" /> 
                    <span>{currentUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-purple-400" /> 
                  <span>{currentUser?.location?.address || 'Mysuru, India'}</span>
                </div>
              </div>
              <div className="p-2 border-t border-white/10 bg-black/40">
                <button 
                  onClick={logout} 
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/15 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={toggleTheme} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-purple-300" />}
        </button>

        <Link to={`/${currentUser?.role || 'user'}/settings`} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
}
