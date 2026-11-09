import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow, Autocomplete } from '@react-google-maps/api';
import { 
  Navigation, 
  Layers, 
  MapPin, 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  Plus, 
  X, 
  CheckCircle2, 
  Compass,
  Building2,
  Crosshair
} from 'lucide-react';
import { mockHeatmapPoints } from '../mock/heatmapPoints';
import { fetchIncidents, subscribeToIncidents } from '../supabase/incidentsService';
import ReportIncidentModal from './ReportIncidentModal';

const libraries = ['places', 'geometry'];

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 12.2958,
  lng: 76.6394
};

// Dark theme for Google Maps
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#18181b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#18181b" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#a1a1aa" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#e4e4e7" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a855f7" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#27272a" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#3f3f46" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d4d4d8" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#4c1d95" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#581c87" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }]
  }
];

export default function MapView({
  center: propCenter = [12.2958, 76.6394],
  zoom = 15,
  showHeatmap = true,
  showZones = true,
  height = "100%"
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries
  });

  const [map, setMap] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({
    lat: propCenter[0] || defaultCenter.lat,
    lng: propCenter[1] || defaultCenter.lng
  });
  const [accuracy, setAccuracy] = useState(50);
  const [isLive, setIsLive] = useState(false);
  const [mapTypeId, setMapTypeId] = useState('roadmap');
  
  // Real incidents from Supabase
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Search & Places
  const [autocomplete, setAutocomplete] = useState(null);
  const [searchPlace, setSearchPlace] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const watchIdRef = useRef(null);

  // 1. Load real incidents from Supabase
  const loadIncidents = useCallback(async () => {
    const data = await fetchIncidents();
    if (data && Array.isArray(data)) {
      setIncidents(data);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
    const unsubscribe = subscribeToIncidents(() => {
      loadIncidents();
    });
    const interval = setInterval(loadIncidents, 8000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [loadIncidents]);

  // 2. Real GPS Live Tracking
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentPosition(coords);
          setAccuracy(pos.coords.accuracy || 40);
          setIsLive(true);
        },
        (err) => console.warn('[GPS] Initial loc info:', err.message),
        { enableHighAccuracy: true, timeout: 6000 }
      );

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentPosition(coords);
          setAccuracy(pos.coords.accuracy || 30);
          setIsLive(true);
        },
        (err) => console.warn('[GPS] Watch info:', err.message),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }

    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Recenter to user's live coordinates
  const recenter = () => {
    if (map && currentPosition) {
      map.panTo(currentPosition);
      map.setZoom(16);
    }
  };

  const toggleLayer = () => {
    setMapTypeId(prev => prev === 'roadmap' ? 'hybrid' : 'roadmap');
  };

  // Places Autocomplete handlers
  const onAutocompleteLoad = (autoInstance) => {
    setAutocomplete(autoInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const newCoords = { lat, lng };

        setSearchPlace({
          name: place.name || place.formatted_address || 'Searched Location',
          address: place.formatted_address || '',
          lat,
          lng
        });

        if (map) {
          map.panTo(newCoords);
          map.setZoom(16);
        }
      }
    }
  };

  // Quick Places Search (Police, Hospitals, Shelters)
  const quickSearch = (term) => {
    setSearchQuery(term);
    if (!map || !window.google?.maps?.places) return;

    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      location: currentPosition,
      radius: 5000,
      keyword: term
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
        const topResult = results[0];
        const lat = topResult.geometry.location.lat();
        const lng = topResult.geometry.location.lng();
        setSearchPlace({
          name: topResult.name,
          address: topResult.vicinity || 'Nearby Emergency Service',
          lat,
          lng
        });
        map.panTo({ lat, lng });
        map.setZoom(15);
      }
    });
  };

  // If there's an error loading Google Maps JS, fall back gracefully
  if (loadError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-card text-center border border-card-border">
        <AlertTriangle className="w-8 h-8 text-danger mb-2" />
        <p className="font-bold text-sm text-text">Google Maps API Error</p>
        <p className="text-xs text-muted mt-1 max-w-sm">{loadError.message}</p>
        <p className="text-[11px] text-primary mt-2">
          Verify HTTP Referrer permissions or billing on your Google Cloud Console for key {apiKey.slice(0, 8)}...
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#18181b] text-text">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-muted tracking-wider uppercase">Loading Google Maps...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-[#18181b] overflow-hidden">
      
      {/* TOP SEARCH BAR (Places API New / Autocomplete) */}
      <div className="absolute top-4 left-4 right-16 z-20 max-w-md pointer-events-auto">
        <div className="relative flex items-center">
          <Autocomplete
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceChanged}
          >
            <div className="relative w-full">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search places, streets, police stations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card/95 backdrop-blur-md text-text pl-10 pr-10 py-2.5 rounded-2xl border border-card-border shadow-2xl focus:outline-none focus:border-primary text-xs font-medium placeholder:text-muted transition-all"
              />
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchPlace(null); }}
                  className="absolute right-3.5 top-3 text-muted hover:text-text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </Autocomplete>
        </div>

        {/* Quick Search Badges */}
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => quickSearch('police station')}
            className="shrink-0 bg-card/90 backdrop-blur px-2.5 py-1 rounded-lg border border-card-border hover:border-blue-500/50 text-[10px] font-bold text-blue-400 flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <ShieldAlert className="w-3 h-3" /> Police Stations
          </button>
          <button
            onClick={() => quickSearch('hospital')}
            className="shrink-0 bg-card/90 backdrop-blur px-2.5 py-1 rounded-lg border border-card-border hover:border-emerald-500/50 text-[10px] font-bold text-emerald-400 flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <Building2 className="w-3 h-3" /> Hospitals
          </button>
          <button
            onClick={() => quickSearch('metro transit station')}
            className="shrink-0 bg-card/90 backdrop-blur px-2.5 py-1 rounded-lg border border-card-border hover:border-primary/50 text-[10px] font-bold text-primary flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <Compass className="w-3 h-3" /> Transit Hubs
          </button>
        </div>
      </div>

      {/* TOP RIGHT: Recenter & Satellite Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={recenter}
          title="Recenter on Live GPS"
          className="p-3 bg-card/95 hover:bg-card text-primary rounded-2xl border border-card-border shadow-2xl backdrop-blur transition-all active:scale-95 flex items-center justify-center cursor-pointer hover:border-primary/50"
        >
          <Navigation className="w-4 h-4 fill-primary" />
        </button>

        <button
          type="button"
          onClick={toggleLayer}
          title={`Switch to ${mapTypeId === 'roadmap' ? 'Satellite' : 'Roadmap'} View`}
          className="p-3 bg-card/95 hover:bg-card text-text rounded-2xl border border-card-border shadow-2xl backdrop-blur transition-all active:scale-95 flex items-center justify-center cursor-pointer hover:border-primary/50"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setReportModalOpen(true)}
          title="Report Hazard or Incident"
          className="p-3 bg-danger/90 hover:bg-danger text-white rounded-2xl border border-danger/50 shadow-2xl backdrop-blur transition-all active:scale-95 flex items-center justify-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* BOTTOM LEFT: Live Status Indicator */}
      <div className="absolute bottom-6 left-4 z-20 pointer-events-none">
        <div className="bg-card/95 backdrop-blur px-3 py-1.5 rounded-xl border border-card-border shadow-lg flex items-center gap-2 pointer-events-auto">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-safe custom-pulse shadow-[0_0_8px_rgba(22,163,74,0.8)]' : 'bg-yellow-500'}`}></span>
          <span className="text-[11px] font-bold text-text">
            {isLive ? 'LIVE GPS ACTIVE' : 'LOCATING GPS...'}
          </span>
          <span className="text-[10px] text-muted font-mono font-medium pl-1 border-l border-card-border">
            {currentPosition.lat.toFixed(4)}°N, {currentPosition.lng.toFixed(4)}°E
          </span>
          <span className="text-[10px] bg-danger/20 text-danger font-bold px-1.5 py-0.5 rounded ml-1">
            {incidents.filter(i => i.status === 'active').length} Incidents
          </span>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={zoom}
        mapTypeId={mapTypeId}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: mapTypeId === 'roadmap' ? darkMapStyle : []
        }}
      >
        {/* User Real GPS Marker (Purple glowing beacon) */}
        <Marker
          position={currentPosition}
          icon={{
            path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
            scale: 9,
            fillColor: '#9333ea',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          }}
          onClick={() => setSelectedIncident({
            title: 'Your Real-Time GPS Position',
            description: `Accuracy: ±${Math.round(accuracy)}m. Pinned to live device telemetry.`,
            latitude: currentPosition.lat,
            longitude: currentPosition.lng,
            isUserSelf: true
          })}
        />

        {/* Accuracy Circle */}
        <Circle
          center={currentPosition}
          radius={Math.min(accuracy, 250)}
          options={{
            fillColor: '#9333ea',
            fillOpacity: 0.12,
            strokeColor: '#9333ea',
            strokeOpacity: 0.35,
            strokeWeight: 1.5
          }}
        />

        {/* SEARCH PLACE RESULT PIN */}
        {searchPlace && (
          <Marker
            position={{ lat: searchPlace.lat, lng: searchPlace.lng }}
            icon={{
              path: window.google?.maps?.SymbolPath?.BACKWARD_CLOSED_ARROW || 1,
              scale: 6,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }}
            onClick={() => setSelectedIncident({
              title: searchPlace.name,
              description: searchPlace.address,
              latitude: searchPlace.lat,
              longitude: searchPlace.lng
            })}
          />
        )}

        {/* REAL SUPABASE INCIDENTS MARKERS (Latitude & Longitude) */}
        {incidents.map((inc) => {
          const lat = Number(inc.latitude);
          const lng = Number(inc.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          const isActive = inc.status === 'active';

          return (
            <Marker
              key={inc.id}
              position={{ lat, lng }}
              icon={{
                path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                scale: isActive ? 10 : 7,
                fillColor: isActive ? '#dc2626' : '#6b7280',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2.5
              }}
              onClick={() => setSelectedIncident(inc)}
            />
          );
        })}

        {/* Heatmap/Risk Zones */}
        {showHeatmap && mockHeatmapPoints.map((point, idx) => (
          <Circle
            key={idx}
            center={{ lat: point.lat, lng: point.lng }}
            radius={300}
            options={{
              fillColor: point.risk === 'high' ? '#DC2626' : point.risk === 'medium' ? '#F59E0B' : '#16A34A',
              fillOpacity: 0.28,
              strokeColor: point.risk === 'high' ? '#DC2626' : point.risk === 'medium' ? '#F59E0B' : '#16A34A',
              strokeWeight: 1.5
            }}
            onClick={() => setSelectedZone(point)}
          />
        ))}

        {/* Safe Zone */}
        {showZones && (
          <Circle
            center={{ lat: 12.2733, lng: 76.6580 }}
            radius={700}
            options={{
              fillColor: '#16A34A',
              fillOpacity: 0.12,
              strokeColor: '#16A34A',
              strokeWeight: 2
            }}
          />
        )}

        {/* INCIDENT DETAILS INFOWINDOW */}
        {selectedIncident && (
          <InfoWindow
            position={{
              lat: Number(selectedIncident.latitude),
              lng: Number(selectedIncident.longitude)
            }}
            onCloseClick={() => setSelectedIncident(null)}
          >
            <div className="p-1 min-w-[200px] text-zinc-900 font-sans">
              <div className="flex items-center gap-1.5 border-b border-zinc-200 pb-1 mb-1.5">
                <AlertTriangle className={`w-4 h-4 ${selectedIncident.isUserSelf ? 'text-purple-600' : 'text-red-600'}`} />
                <span className="font-bold text-xs leading-tight">
                  {selectedIncident.title || 'Reported Incident'}
                </span>
              </div>

              <p className="text-[11px] text-zinc-600 mb-2 leading-relaxed">
                {selectedIncident.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono bg-zinc-100 p-1.5 rounded">
                <span>{Number(selectedIncident.latitude).toFixed(4)}° N, {Number(selectedIncident.longitude).toFixed(4)}° E</span>
                {selectedIncident.status && (
                  <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${selectedIncident.status === 'active' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {selectedIncident.status}
                  </span>
                )}
              </div>

              {selectedIncident.created_at && (
                <p className="text-[9px] text-zinc-400 mt-1 text-right">
                  {new Date(selectedIncident.created_at).toLocaleString()}
                </p>
              )}
            </div>
          </InfoWindow>
        )}

        {/* ZONE DETAILS INFOWINDOW */}
        {selectedZone && (
          <InfoWindow
            position={{ lat: selectedZone.lat, lng: selectedZone.lng }}
            onCloseClick={() => setSelectedZone(null)}
          >
            <div className="p-1 min-w-[160px] text-zinc-900 font-sans">
              <p className="font-bold text-xs">{selectedZone.label}</p>
              <span className={`inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded mt-1 ${selectedZone.risk === 'high' ? 'bg-red-100 text-red-700' : selectedZone.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {selectedZone.risk} Risk Zone
              </span>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* REPORT INCIDENT MODAL */}
      <ReportIncidentModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        userCoords={currentPosition}
        onIncidentReported={() => loadIncidents()}
      />
    </div>
  );
}
