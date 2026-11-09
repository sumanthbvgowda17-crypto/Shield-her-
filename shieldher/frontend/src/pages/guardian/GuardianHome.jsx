import React from 'react';
import Navbar from '../../components/Navbar';
import MapView from '../../components/MapView';
import AlertFeed from '../../components/AlertFeed';
import { mockUserData } from '../../mock/userData';
import { Phone, MessageSquare, ShieldCheck, Siren } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GuardianHome() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Status Card */}
        <div className="flex flex-col gap-6">
          <div className="bg-card border border-card-border p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-safe"></span>
              </span>
            </div>
            
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary text-2xl font-bold mb-4">
              {mockUserData.name[0]}
            </div>
            <h2 className="text-2xl font-bold">{mockUserData.name}</h2>
            <p className="text-muted flex items-center gap-2 mt-1">
              Currently at: <span className="text-text font-medium">{mockUserData.location.address}</span>
            </p>
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-card-border">
                <span className="text-muted text-sm">Risk Level</span>
                <span className="font-bold text-yellow-500 uppercase">{mockUserData.riskLevel}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-card-border">
                <span className="text-muted text-sm">Device Battery</span>
                <span className="font-bold text-safe">{mockUserData.device.battery}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-card-border">
                <span className="text-muted text-sm">Last Ping</span>
                <span className="font-bold">{mockUserData.device.last_ping}</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2 bg-background border border-card-border rounded-lg hover:border-primary transition-colors">
                <Phone className="w-4 h-4 text-primary" /> Call
              </button>
              <Link to="/guardian/messages" className="flex items-center justify-center gap-2 py-2 bg-background border border-card-border rounded-lg hover:border-primary transition-colors">
                <MessageSquare className="w-4 h-4 text-primary" /> Msg
              </Link>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Live Map */}
        <div className="lg:col-span-1 h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">Live Map</h3>
            <Link to="/guardian/map" className="text-primary text-sm hover:underline">Expand full map</Link>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden shadow-lg border border-card-border relative">
            <MapView center={[mockUserData.location.lat, mockUserData.location.lng]} height="100%" showHeatmap={true} />
          </div>
        </div>

        {/* RIGHT COLUMN: Alerts */}
        <div className="lg:col-span-1 h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">Activity Feed</h3>
            <Link to="/guardian/alerts" className="text-primary text-sm hover:underline">View all</Link>
          </div>
          <AlertFeed />
        </div>
      </main>

      {/* Emergency Actions Bar */}
      <div className="bg-card border-t border-card-border p-4 sticky bottom-0">
        <div className="max-w-7xl mx-auto flex gap-4 justify-end">
          <Link to="/guardian/alerts" className="flex items-center gap-2 px-6 py-3 bg-danger/10 text-danger border border-danger/30 rounded-lg hover:bg-danger/20 font-bold transition-colors">
            <Siren className="w-5 h-5" /> RESPOND TO SOS
          </Link>
          <button className="flex items-center gap-2 px-6 py-3 bg-safe/10 text-safe border border-safe/30 rounded-lg hover:bg-safe/20 font-bold transition-colors">
            <ShieldCheck className="w-5 h-5" /> MARK SAFE
          </button>
        </div>
      </div>
    </div>
  );
}
