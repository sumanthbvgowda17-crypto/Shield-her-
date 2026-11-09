import React from 'react';
import Navbar from '../../components/Navbar';
import { Settings as SettingsIcon, Bell, Users, ShieldAlert } from 'lucide-react';
import { mockUserData } from '../../mock/userData';

export default function GuardianSettings() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-6 max-w-lg mx-auto w-full space-y-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" /> Settings
        </h1>

        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-card-border">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> People I'm Watching</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center bg-background p-3 rounded-lg border border-card-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                  {mockUserData.name[0]}
                </div>
                <p className="font-medium">{mockUserData.name}</p>
              </div>
              <button className="text-xs text-danger border border-danger/30 px-3 py-1 rounded hover:bg-danger/10 transition-colors">Stop Watching</button>
            </div>
            <button className="w-full py-2 bg-background border border-dashed border-card-border text-muted rounded-lg hover:border-primary hover:text-primary transition-colors">
              Add Person
            </button>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-card-border">
            <h3 className="font-semibold text-lg flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-primary" /> Alert Sensitivity</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-background border border-primary/50 rounded-lg cursor-pointer">
                <input type="radio" name="sensitivity" defaultChecked className="accent-primary w-4 h-4" />
                <div>
                  <p className="font-medium text-sm">All Events</p>
                  <p className="text-xs text-muted">SOS, Danger zones, battery low, geofence exits</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-background border border-card-border rounded-lg cursor-pointer">
                <input type="radio" name="sensitivity" className="accent-primary w-4 h-4" />
                <div>
                  <p className="font-medium text-sm">SOS Only</p>
                  <p className="text-xs text-muted">Only notify me when SOS is triggered</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl overflow-hidden mb-8">
          <div className="p-4 border-b border-card-border">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Bell className="w-5 h-5 text-primary" /> Notifications</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Push Notifications</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SMS Fallback</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
