import React from 'react';
import Navbar from '../../components/Navbar';
import DeviceStatusCard from '../../components/DeviceStatusCard';
import GuardianStatusBar from '../../components/GuardianStatusBar';
import { mockUserData } from '../../mock/userData';
import { ShieldCheck, UserCheck, UserMinus } from 'lucide-react';

export default function UserStatus() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <GuardianStatusBar />

      <main className="flex-1 p-6 max-w-lg mx-auto w-full space-y-6">
        <div className="bg-safe/10 border border-safe/30 rounded-xl p-4 flex items-center gap-4 text-safe">
          <ShieldCheck className="w-8 h-8" />
          <div>
            <h2 className="font-bold">System Active & Protecting</h2>
            <p className="text-sm opacity-90">Inside safe zone ✓</p>
          </div>
        </div>

        <DeviceStatusCard />

        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-card-border bg-background/50">
            <h3 className="font-semibold text-lg">Trusted Guardians</h3>
            <p className="text-xs text-muted mt-1">You are being monitored by {mockUserData.guardians.filter(g => g.watching).length} guardians</p>
          </div>
          
          <div className="p-4 space-y-4">
            {mockUserData.guardians.map((guardian, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-card-border bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {guardian.name[0]}
                  </div>
                  <div>
                    <p className="font-medium">{guardian.name}</p>
                    <p className="text-xs text-muted flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${guardian.status === 'online' ? 'bg-safe' : 'bg-muted'}`}></span>
                      {guardian.status.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div>
                  {guardian.watching ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-safe bg-safe/10 px-2 py-1 rounded">
                      <UserCheck className="w-3 h-3" /> Watching
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-muted bg-card px-2 py-1 rounded border border-card-border">
                      <UserMinus className="w-3 h-3" /> Offline
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
