import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import AdBanner from './components/AdBanner';
import MapComponent from './components/MapComponent';
import StationList from './components/StationList';
import StationDetailDrawer from './components/StationDetailDrawer';
import TripCalculatorModal from './components/TripCalculatorModal';
import PriceReportModal from './components/PriceReportModal';
import ReviewModal from './components/ReviewModal';
import PriceTrendModal from './components/PriceTrendModal';
import MonetizationInfoModal from './components/MonetizationInfoModal';

import { initialStations } from './data/mockStations';
import { generateNearbyStations } from './utils/stationGenerator';
import { translations } from './i18n/translations';

// Haversine formula to compute exact distance in km between two lat/lng points
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

export default function App() {
  const [currentLang, setCurrentLang] = useState('it');
  const [userPoints, setUserPoints] = useState(350);
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  
  // Location state (Default to Rome center)
  const [userLocation, setUserLocation] = useState({ 
    lat: 41.9028, 
    lng: 12.4964,
    name: "Roma, Italia",
    addressDetails: { city: "Roma", postcode: "00100", county: "Roma", country_code: "it" }
  });
  
  // App Filter States
  const [selectedFuelType, setSelectedFuelType] = useState('petrol');
  const [selectedServiceMode, setSelectedServiceMode] = useState('self');
  const [sortBy, setSortBy] = useState('price');
  const [searchRadiusKm, setSearchRadiusKm] = useState(25);
  
  // Data State
  const [stations, setStations] = useState(initialStations);
  const [selectedStation, setSelectedStation] = useState(null);

  // Modals state
  const [isTripCalcOpen, setIsTripCalcOpen] = useState(false);
  const [isTrendsOpen, setIsTrendsOpen] = useState(false);
  const [reportTargetStation, setReportTargetStation] = useState(null);
  const [reviewTargetStation, setReviewTargetStation] = useState(null);
  const [isMonetizationInfoOpen, setIsMonetizationInfoOpen] = useState(false);

  const t = translations[currentLang] || translations.en;

  // Ensure gas stations ALWAYS exist near user's current location anywhere in the world!
  useEffect(() => {
    // Check if there are stations near current userLocation
    const nearbyCount = stations.filter(st => {
      const dist = getHaversineDistance(userLocation.lat, userLocation.lng, st.lat, st.lng);
      return dist <= searchRadiusKm;
    }).length;

    // If fewer than 2 stations exist in the area, generate dynamic local stations!
    if (nearbyCount < 2) {
      const newLocalStations = generateNearbyStations(userLocation.lat, userLocation.lng, userLocation);
      setStations(prev => {
        // Prevent duplicate IDs
        const existingIds = new Set(prev.map(s => s.id));
        const filteredNew = newLocalStations.filter(s => !existingIds.has(s.id));
        return [...prev, ...filteredNew];
      });
    }
  }, [userLocation, searchRadiusKm]);

  // Real Browser Geolocation Trigger with Reverse Geocoding Address Details
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          let placeName = "La mia posizione GPS";
          let addressDetails = null;

          try {
            // Reverse geocode to get city name & full address object
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
              placeName = data.display_name;
              addressDetails = data.address || null;
            }
          } catch (e) {
            console.warn('Reverse geocode error:', e);
          }

          setUserLocation({
            lat,
            lng,
            name: placeName,
            addressDetails
          });
        },
        (error) => {
          console.warn('Geolocation failed or denied:', error);
          alert('Posizione GPS non disponibile. Assicurati di aver dato i permessi al browser o digita la città nella barra di ricerca.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert('La geolocalizzazione non è supportata dal tuo browser.');
    }
  };

  // Real OpenStreetMap Nominatim Live Geocoding with addressdetails=1
  const handleSearchLocation = async (query) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        setUserLocation({
          lat: parseFloat(first.lat),
          lng: parseFloat(first.lon),
          name: first.display_name,
          addressDetails: first.address || null
        });
      } else {
        alert(`Nessuna località trovata per: "${query}"`);
      }
    } catch (err) {
      console.error('Error during geocoding:', err);
      alert('Errore di connessione durante la ricerca della posizione.');
    }
  };

  // Compute processed, filtered and dynamically distance-calculated station list
  const processedStations = useMemo(() => {
    // 1. Calculate dynamic Haversine distance relative to current userLocation
    let list = stations.map(st => {
      const dist = getHaversineDistance(userLocation.lat, userLocation.lng, st.lat, st.lng);
      return {
        ...st,
        distanceKm: dist
      };
    });

    // 2. Filter by country if selected
    if (selectedCountry !== 'ALL') {
      list = list.filter(st => st.country === selectedCountry);
    }

    // 3. Filter by search radius (km)
    list = list.filter(st => st.distanceKm <= searchRadiusKm);

    // 4. Identify lowest & highest price in active filtered set
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    list.forEach(st => {
      const fuelObj = st.prices[selectedFuelType];
      if (fuelObj) {
        const val = selectedServiceMode === 'served' && fuelObj.served ? fuelObj.served : fuelObj.self;
        if (val < minPrice) minPrice = val;
        if (val > maxPrice) maxPrice = val;
      }
    });

    list = list.map(st => {
      const fuelObj = st.prices[selectedFuelType];
      const val = fuelObj ? (selectedServiceMode === 'served' && fuelObj.served ? fuelObj.served : fuelObj.self) : null;
      return {
        ...st,
        isCheapest: val === minPrice && minPrice !== Infinity,
        isExpensive: val === maxPrice && maxPrice !== -Infinity && maxPrice !== minPrice
      };
    });

    // 5. Sort list
    list.sort((a, b) => {
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;

      if (sortBy === 'price') {
        const priceA = a.prices[selectedFuelType]?.self || 99;
        const priceB = b.prices[selectedFuelType]?.self || 99;
        return priceA - priceB;
      } else if (sortBy === 'distance') {
        return a.distanceKm - b.distanceKm;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

    return list;
  }, [stations, userLocation, selectedCountry, selectedFuelType, selectedServiceMode, sortBy, searchRadiusKm]);

  // Handle Price Report Update from user
  const handleUpdatePrice = (stationId, fuelType, serviceMode, priceVal) => {
    setStations(prev => prev.map(st => {
      if (st.id === stationId) {
        const updatedPrices = { ...st.prices };
        if (!updatedPrices[fuelType]) {
          updatedPrices[fuelType] = { self: priceVal, served: priceVal + 0.15 };
        } else {
          updatedPrices[fuelType] = {
            ...updatedPrices[fuelType],
            [serviceMode]: priceVal
          };
        }
        return {
          ...st,
          prices: updatedPrices,
          updatedHoursAgo: 0,
          updatedBy: "Tu (Verificato)"
        };
      }
      return st;
    }));

    // Award +50 points
    setUserPoints(pts => pts + 50);
  };

  // Handle Review Submission
  const handleAddReview = (stationId, newReview) => {
    setStations(prev => prev.map(st => {
      if (st.id === stationId) {
        return {
          ...st,
          reviewsCount: st.reviewsCount + 1,
          reviews: [newReview, ...st.reviews]
        };
      }
      return st;
    }));
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans pb-16 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Header */}
      <Header
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        userPoints={userPoints}
        onSearch={handleSearchLocation}
        onLocate={handleLocateMe}
        onOpenTripCalc={() => setIsTripCalcOpen(true)}
        onOpenTrends={() => setIsTrendsOpen(true)}
        onOpenMonetizationInfo={() => setIsMonetizationInfoOpen(true)}
      />

      {/* Main Grid Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Interactive Map View (7 cols on desktop) */}
        <section className="lg:col-span-7 h-[420px] lg:h-[calc(100vh-140px)] sticky top-20">
          <MapComponent
            userLocation={userLocation}
            stations={processedStations}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
            selectedFuelType={selectedFuelType}
            selectedServiceMode={selectedServiceMode}
            searchRadiusKm={searchRadiusKm}
            currentLang={currentLang}
          />
        </section>

        {/* Right Column: Station List & Filters (5 cols on desktop) */}
        <section className="lg:col-span-5 h-[500px] lg:h-[calc(100vh-140px)]">
          <StationList
            stations={processedStations}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
            selectedFuelType={selectedFuelType}
            onSelectFuelType={setSelectedFuelType}
            selectedServiceMode={selectedServiceMode}
            onSelectServiceMode={setSelectedServiceMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
            searchRadiusKm={searchRadiusKm}
            onRadiusChange={setSearchRadiusKm}
            onOpenReportModal={(st) => setReportTargetStation(st)}
            currentLang={currentLang}
          />
        </section>

      </main>

      {/* Slide-over Station Detail Drawer */}
      <StationDetailDrawer
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        onOpenReportModal={(st) => setReportTargetStation(st)}
        onOpenReviewModal={(st) => setReviewTargetStation(st)}
        currentLang={currentLang}
      />

      {/* Trip Cost Calculator Modal */}
      <TripCalculatorModal
        isOpen={isTripCalcOpen}
        onClose={() => setIsTripCalcOpen(false)}
        stations={stations}
        currentLang={currentLang}
      />

      {/* Price Report Crowdsource Modal */}
      <PriceReportModal
        isOpen={!!reportTargetStation}
        onClose={() => setReportTargetStation(null)}
        station={reportTargetStation}
        onUpdatePrice={handleUpdatePrice}
        currentLang={currentLang}
      />

      {/* Review & Rating Modal */}
      <ReviewModal
        isOpen={!!reviewTargetStation}
        onClose={() => setReviewTargetStation(null)}
        station={reviewTargetStation}
        onAddReview={handleAddReview}
        currentLang={currentLang}
      />

      {/* Historical Price Trends Modal */}
      <PriceTrendModal
        isOpen={isTrendsOpen}
        onClose={() => setIsTrendsOpen(false)}
        currentLang={currentLang}
      />

      {/* App Store & Monetization Info Guide Modal */}
      <MonetizationInfoModal
        isOpen={isMonetizationInfoOpen}
        onClose={() => setIsMonetizationInfoOpen(false)}
        currentLang={currentLang}
      />

      {/* AdMob Banner Simulation Footer */}
      <AdBanner
        currentLang={currentLang}
        onUpgradePremium={() => alert("🎉 FuelSaver Premium Attivato! Annunci Rimossi e Modalità Offline Sbloccata.")}
      />

    </div>
  );
}
