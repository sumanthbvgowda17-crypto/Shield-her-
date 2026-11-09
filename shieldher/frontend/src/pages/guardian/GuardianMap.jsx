import React from 'react';
import Navbar from '../../components/Navbar';
import MapView from '../../components/MapView';
import { Share2, Clock, MapPin } from 'lucide-react';
import { mockUserData } from '../../mock/userData';

export default function GuardianMap() {
  const [center, setCenter] = React.useState([mockUserData.location.lat, mockUserData.location.lng]);
  const [isSOS, setIsSOS] = React.useState(false);

  React.useEffect(() => {
    const pollLocation = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/sos/active');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const active = data.find(a => a.status === 'active');
          if (active && active.lat && active.lng) {
            setCenter([active.lat, active.lng]);
            setIsSOS(true);
          } else {
            setIsSOS(false);
          }
        }
      } catch (e) {
        // server offline
      }
    };

    pollLocation();
    const interval = setInterval(pollLocation, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />
      
      <main className="flex-1 relative" style={{ minHeight: 0 }}>
        <MapView 
          center={center} 
          zoom={15} 
          height="100%" 
          showHeatmap={true}
          showZones={true}
        />

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md z-[1000] px-4 pointer-events-none">
          <div className="bg-card/90 backdrop-blur border border-card-border p-4 rounded-xl shadow-2xl pointer-events-auto">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Current Location
                </p>
                <p className="font-bold">{mockUserData.location.address}</p>
                <p className="text-xs text-muted font-mono mt-1">
                  {center[0].toFixed(4)}, {center[1].toFixed(4)}
                </p>
              </div>
              <button className="p-2 bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4 pt-3 border-t border-card-border flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated live</span>
              <span className={`flex items-center gap-1 font-bold ${isSOS ? 'text-danger' : 'text-safe'}`}>
                <div className={`w-2 h-2 rounded-full ${isSOS ? 'bg-danger animate-ping' : 'bg-safe custom-pulse'}`}></div> 
                {isSOS ? 'SOS BROADCAST ACTIVE' : 'Status: Normal'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
