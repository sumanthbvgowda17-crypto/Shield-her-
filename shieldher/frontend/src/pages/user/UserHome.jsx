import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import GuardianStatusBar from '../../components/GuardianStatusBar';
import { Link } from 'react-router-dom';
import { ShieldAlert, Activity, Map, Cpu, Zap, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { fetchIncidents, subscribeToIncidents } from '../../supabase/incidentsService';
import { useAuth } from '../../context/AuthContext';

export default function UserHome() {
  const { currentUser } = useAuth();
  const [activeIncidents, setActiveIncidents] = useState(0);

  useEffect(() => {
    const load = async () => {
      const data = await fetchIncidents();
      if (Array.isArray(data)) {
        setActiveIncidents(data.filter(i => i.status === 'active').length);
      }
    };
    load();
    const unsub = subscribeToIncidents(() => load());
    return () => unsub();
  }, []);

  const userName = currentUser?.name?.split(' ')[0] || 'Manya';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <GuardianStatusBar />

      <main className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col pb-24">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-text mb-1">Welcome back, {userName}</h1>
          <p className="text-muted text-sm">All systems operational. Guardians are watching.</p>
        </div>

        {/* Live Safety Status Banner (Powered by Supabase) */}
        <Link to="/user/map" className="block mb-4">
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between shadow-lg ${
            activeIncidents > 0 
              ? 'bg-danger/10 border-danger/40 hover:bg-danger/15 text-danger' 
              : 'bg-safe/10 border-safe/30 hover:bg-safe/15 text-safe'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${activeIncidents > 0 ? 'bg-danger text-white' : 'bg-safe text-white'}`}>
                {activeIncidents > 0 ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-text">
                  {activeIncidents > 0 ? `${activeIncidents} Active Incidents Logged Nearby` : 'Local Safety Normal'}
                </p>
                <p className="text-[11px] text-muted">
                  {activeIncidents > 0 ? 'Tap to view live hazard pins on Google Map' : 'Zero active safety threats reported in your sector'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted" />
          </div>
        </Link>

        <div className="space-y-4">
          <MenuCard 
            to="/user/emergency" 
            icon={<ShieldAlert className="w-8 h-8 text-danger" />} 
            title="Command Center" 
            desc="SOS, Voice Trigger, Silent Alarm" 
            gradient="from-danger/20 to-transparent"
          />
          <MenuCard 
            to="/user/risk" 
            icon={<Activity className="w-8 h-8 text-yellow-500" />} 
            title="Environmental Risk" 
            desc="AI Safety Analysis & History" 
            gradient="from-yellow-500/20 to-transparent"
          />
          <MenuCard 
            to="/user/map" 
            icon={<Map className="w-8 h-8 text-blue-500" />} 
            title="Live Tracking" 
            desc="GPS Maps, Places Search & Incidents" 
            gradient="from-blue-500/20 to-transparent"
          />
          <MenuCard 
            to="/user/device" 
            icon={<Cpu className="w-8 h-8 text-safe" />} 
            title="Hardware Status" 
            desc="SH-001 Diagnostics & Battery" 
            gradient="from-safe/20 to-transparent"
          />
          <MenuCard 
            to="/user/actions" 
            icon={<Zap className="w-8 h-8 text-primary" />} 
            title="Tactical Actions" 
            desc="Report Incident, Fake Call, Siren" 
            gradient="from-primary/20 to-transparent"
          />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function MenuCard({ to, icon, title, desc, gradient }) {
  return (
    <Link to={to} className="block group">
      <div className="bg-card border border-card-border hover:border-primary/50 transition-all rounded-2xl p-5 flex items-center justify-between relative overflow-hidden shadow-lg">
        <div className={`absolute top-0 left-0 w-32 h-full bg-gradient-to-r ${gradient} opacity-50`}></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-background border border-card-border p-3 rounded-xl shadow-inner">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-xs text-muted mt-0.5">{desc}</p>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary group-hover:translate-x-1 transition-all relative z-10" />
      </div>
    </Link>
  );
}
