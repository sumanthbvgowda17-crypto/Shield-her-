import React from 'react';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import RiskGauge from '../../components/RiskGauge';
import HistoricalRiskChart from '../../components/HistoricalRiskChart';

export default function UserRisk() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col pb-24">
        <h1 className="text-3xl font-black mb-6 tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          Environmental Intelligence
        </h1>
        
        <div className="flex-1">
          <RiskGauge />
        </div>

        <HistoricalRiskChart />
      </main>

      <BottomNav />
    </div>
  );
}
