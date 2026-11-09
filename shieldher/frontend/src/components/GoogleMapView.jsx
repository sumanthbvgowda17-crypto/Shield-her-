import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { Navigation, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';
import { mockHeatmapPoints } from '../mock/heatmapPoints';

const libraries = ['places', 'geometry'];

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px'
};

const defaultCenter = {
  lat: 12.2958,
  lng: 76.6394
};

// Sleek dark/custom theme for Google Maps
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }]
  }
];

export default function GoogleMapView({
  apiKey,
  showHeatmap = true,
  showZones = true,
  height = "100%"
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries
  });

  const [map, setMap] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(defaultCenter);
  const [accuracy, setAccuracy] = useState(100);
  const [isLive, setIsLive] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapTypeId, setMapTypeId] = useState('roadmap');
  const watchIdRef = useRef(null);

  // Live GPS Tracking
  useEffect(() => {
    if (navigator.geolocation) {
      // 1. Initial quick position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setCurrentPosition(coords);
          setAccuracy(pos.coords.accuracy || 80);
          setIsLive(true);
          if (map) map.panTo(coords);
        },
        (err) => console.warn('[GPS] Initial loc warning:', err.message),
        { enableHighAccuracy: true, timeout: 5000 }
      );

      // 2. Real-time watch position
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setCurrentPosition(coords);
          setAccuracy(pos.coords.accuracy || 50);
          setIsLive(true);
        },
        (err) => console.warn('[GPS] Watch warning:', err.message),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    }

    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [map]);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const recenter = () => {
    if (map && currentPosition) {
      map.panTo(currentPosition);
      map.setZoom(16);
    }
  };

  const toggleLayer = () => {
    setMapTypeId(prev => prev === 'roadmap' ? 'hybrid' : 'roadmap');
  };

  if (loadError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-card text-center border border-card-border rounded-2xl">
        <AlertTriangle className="w-8 h-8 text-danger mb-2" />
        <p className="font-bold text-sm text-text">Error loading Google Maps</p>
        <p className="text-xs text-muted mt-1 max-w-sm">{loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-card border border-card-border rounded-2xl p-6">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-muted">Initializing Google Maps...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-card-border shadow-inner" style={{ height }}>
      {/* Control Overlay Buttons */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={recenter}
          title="Recenter on My Location"
          className="p-2.5 bg-card/95 hover:bg-card text-primary rounded-xl border border-card-border shadow-lg backdrop-blur transition-all active:scale-95 flex items-center justify-center"
        >
          <Navigation className="w-4 h-4 fill-primary" />
        </button>

        <button
          type="button"
          onClick={toggleLayer}
          title="Toggle Satellite / Streets"
          className="p-2.5 bg-card/95 hover:bg-card text-text rounded-xl border border-card-border shadow-lg backdrop-blur transition-all active:scale-95 flex items-center justify-center"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Live Indicator Pill */}
      <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur px-3 py-1.5 rounded-xl border border-card-border shadow-md flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-safe custom-pulse' : 'bg-yellow-500'}`}></span>
        <span className="text-[11px] font-bold text-text">
          {isLive ? 'LIVE GPS ACTIVE' : 'CONNECTING GPS...'}
        </span>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={15}
        mapTypeId={mapTypeId}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: mapTypeId === 'roadmap' ? darkMapStyle : []
        }}
      >
        {/* User Real GPS Marker */}
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
          onClick={() => setSelectedMarker({
            title: 'Your Real-Time Location',
            lat: currentPosition.lat,
            lng: currentPosition.lng,
            accuracy: Math.round(accuracy)
          })}
        />

        {/* Accuracy Radius Circle */}
        <Circle
          center={currentPosition}
          radius={Math.min(accuracy, 200)}
          options={{
            fillColor: '#9333ea',
            fillOpacity: 0.15,
            strokeColor: '#9333ea',
            strokeOpacity: 0.4,
            strokeWeight: 1.5
          }}
        />

        {/* Heatmap/Risk Zones */}
        {showHeatmap && mockHeatmapPoints.map((point, idx) => (
          <Circle
            key={idx}
            center={{ lat: point.lat, lng: point.lng }}
            radius={250}
            options={{
              fillColor: point.risk === 'high' ? '#DC2626' : point.risk === 'medium' ? '#F59E0B' : '#16A34A',
              fillOpacity: 0.28,
              strokeColor: point.risk === 'high' ? '#DC2626' : point.risk === 'medium' ? '#F59E0B' : '#16A34A',
              strokeWeight: 1.5
            }}
            onClick={() => setSelectedMarker({
              title: `${point.label} (${point.risk.toUpperCase()} Risk)`,
              lat: point.lat,
              lng: point.lng,
              risk: point.risk
            })}
          />
        ))}

        {/* Safe Zone */}
        {showZones && (
          <Circle
            center={{ lat: 12.2733, lng: 76.6580 }}
            radius={600}
            options={{
              fillColor: '#16A34A',
              fillOpacity: 0.12,
              strokeColor: '#16A34A',
              strokeWeight: 2
            }}
          />
        )}

        {/* InfoWindow */}
        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-1 text-gray-900 max-w-[180px]">
              <p className="font-bold text-xs">{selectedMarker.title}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                {selectedMarker.lat.toFixed(4)}, {selectedMarker.lng.toFixed(4)}
              </p>
              {selectedMarker.accuracy && (
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                  GPS Accuracy: ±{selectedMarker.accuracy}m
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

