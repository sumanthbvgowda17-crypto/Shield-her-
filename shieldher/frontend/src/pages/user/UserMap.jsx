import React from 'react';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import MapView from '../../components/MapView';

export default function UserMap() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      {/* Map fills remaining viewport minus navbar (~64px) and bottom nav (~56px) */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <MapView height="100%" showHeatmap={true} showZones={true} />
      </div>

      <BottomNav />
    </div>
  );
}
