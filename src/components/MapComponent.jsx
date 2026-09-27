import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Fuel, Star, MapPin, Zap, Navigation } from 'lucide-react';
import { translations } from '../i18n/translations';

// Helper component to smoothly center map on user or selected station
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ 
  userLocation, 
  stations, 
  selectedStation, 
  onSelectStation, 
  selectedFuelType, 
  selectedServiceMode, 
  searchRadiusKm,
  currentLang 
}) {
  const t = translations[currentLang] || translations.en;
  const centerPos = selectedStation 
    ? [selectedStation.lat, selectedStation.lng] 
    : [userLocation.lat, userLocation.lng];

  // Helper to create custom divIcon pins with price text
  const createPinIcon = (station) => {
    const fuelPriceObj = station.prices[selectedFuelType];
    let priceText = "N/A";
    if (fuelPriceObj) {
      priceText = selectedServiceMode === 'served' && fuelPriceObj.served
        ? fuelPriceObj.served.toFixed(3)
        : fuelPriceObj.self.toFixed(3);
    }

    let pinClass = "pin-average";
    if (station.isSponsored) {
      pinClass = "pin-sponsored";
    } else if (station.isCheapest) {
      pinClass = "pin-cheapest";
    } else if (station.isExpensive) {
      pinClass = "pin-expensive";
    }

    const htmlString = `
      <div class="custom-station-pin ${pinClass}">
        ${station.isSponsored ? '⭐ ' : ''}€${priceText}
      </div>
    `;

    return L.divIcon({
      className: 'custom-pin-wrapper',
      html: htmlString,
      iconSize: [75, 32],
      iconAnchor: [37, 16]
    });
  };

  // User position pin
  const userPinIcon = L.divIcon({
    className: 'user-pin-wrapper',
    html: `
      <div style="background: #3b82f6; border: 3px solid #ffffff; width: 22px; height: 22px; border-radius: 50%; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); animation: pulse 1.5s infinite;"></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <MapContainer 
        center={centerPos} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full z-10"
      >
        <ChangeView center={centerPos} zoom={13} />
        
        {/* Free OpenStreetMap Tiles (No API key required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Search Radius Circle Overlay */}
        <Circle 
          center={[userLocation.lat, userLocation.lng]} 
          radius={searchRadiusKm * 1000} 
          pathOptions={{ fillColor: '#10b981', fillOpacity: 0.08, color: '#10b981', weight: 1.5, dashArray: '4, 8' }} 
        />

        {/* User Location Marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userPinIcon}>
          <Popup className="custom-leaflet-popup">
            <div className="p-1 text-slate-900 font-bold text-xs flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{userLocation.name || t.useMyLocation}</span>
            </div>
          </Popup>
        </Marker>

        {/* Fuel Stations Markers */}
        {stations.map((st) => (
          <Marker 
            key={st.id} 
            position={[st.lat, st.lng]} 
            icon={createPinIcon(st)}
            eventHandlers={{
              click: () => onSelectStation(st)
            }}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-2 text-slate-900 max-w-xs">
                <div className="flex items-center gap-1.5 font-extrabold text-sm text-slate-900">
                  <Fuel className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{st.name}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{st.address}</p>

                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">{t.fuelTypes[selectedFuelType]}</span>
                    <span className="text-base font-black text-emerald-600">
                      €{st.prices[selectedFuelType]?.self ? st.prices[selectedFuelType].self.toFixed(3) : 'N/A'}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectStation(st)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    {t.actions.viewDetails}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
}
