import React, { useState, useMemo, useEffect, useRef } from 'react';
import Header from './components/Header';
import AdBanner from './components/AdBanner';
import MapComponent from './components/MapComponent';
import StationList from './components/StationList';
import StationDetailDrawer from './components/StationDetailDrawer';
import TripCalculatorModal from './components/TripCalculatorModal';
import PriceReportModal from './components/PriceReportModal';
import ReviewModal from './components/ReviewModal';
import PriceTrendModal from './components/PriceTrendModal';
import ProModal from './components/ProModal';
import PremiumGateModal from './components/PremiumGateModal';

import { translations } from './i18n/translations';
import { fetchStations } from './services/fuelDataService';
import { getPrice, isStale } from './utils/price';
import { initMonetization, trackAdAction, isFeatureUnlocked } from './services/monetization';

// Contributi dell'utente (segnalazioni prezzo, recensioni) salvati sul dispositivo.
// TODO: sincronizzarli su un backend con moderazione per condividerli con la community.
const OVERLAYS_KEY = 'fuelsaver.userOverlays';
function loadOverlays() {
  try {
    return JSON.parse(localStorage.getItem(OVERLAYS_KEY)) || {};
  } catch {
    return {};
  }
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
  const [searchRadiusKm, setSearchRadiusKm] = useState(10);

  // Data State: solo prezzi da fonti ufficiali, nessun dato generato
  const [stations, setStations] = useState([]);
  const [dataStatus, setDataStatus] = useState({ loading: true, error: false, supported: true, sources: [] });
  const [overlays, setOverlays] = useState(loadOverlays);
  const [selectedStation, setSelectedStation] = useState(null);

  // Modals state
  const [isTripCalcOpen, setIsTripCalcOpen] = useState(false);
  const [isTrendsOpen, setIsTrendsOpen] = useState(false);
  const [reportTargetStation, setReportTargetStation] = useState(null);
  const [reviewTargetStation, setReviewTargetStation] = useState(null);
  const [isProOpen, setIsProOpen] = useState(false);
  const [gatedFeature, setGatedFeature] = useState(null);

  const t = translations[currentLang] || translations.en;

  // Pubblicità (video all'apertura + banner) e verifica acquisto Pro
  useEffect(() => {
    initMonetization().catch(err => console.warn('Monetization init failed', err));
  }, []);

  // Funzioni premium: sbloccate da Pro o da un video premio (24 h)
  const openFeature = (feature) => {
    trackAdAction();
    if (!isFeatureUnlocked(feature)) {
      setGatedFeature(feature);
      return;
    }
    if (feature === 'tripCalculator') setIsTripCalcOpen(true);
    if (feature === 'priceStats') setIsTrendsOpen(true);
  };

  const handleSelectStation = (st) => {
    if (st && st.id !== selectedStation?.id) trackAdAction();
    setSelectedStation(st);
  };

  // Scarica i distributori reali quando cambia posizione o raggio (debounce per lo slider)
  useEffect(() => {
    const controller = new AbortController();
    setDataStatus(prev => ({ ...prev, loading: true, error: false }));
    const timer = setTimeout(async () => {
      try {
        const res = await fetchStations(userLocation.lat, userLocation.lng, searchRadiusKm, controller.signal);
        setStations(res.stations);
        setDataStatus({ loading: false, error: false, supported: res.supported, sources: res.sources });
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('Fuel data fetch failed:', err);
        setStations([]);
        setDataStatus({ loading: false, error: true, supported: true, sources: [] });
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [userLocation.lat, userLocation.lng, searchRadiusKm]);

  useEffect(() => {
    try {
      localStorage.setItem(OVERLAYS_KEY, JSON.stringify(overlays));
    } catch {
      // storage non disponibile (navigazione privata): i contributi restano in memoria
    }
  }, [overlays]);

  // Real Browser Geolocation Trigger with Reverse Geocoding Address Details
  const handleLocateMe = ({ silent = false } = {}) => {
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
          if (!silent) alert('Posizione GPS non disponibile. Assicurati di aver dato i permessi al browser o digita la città nella barra di ricerca.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else if (!silent) {
      alert('La geolocalizzazione non è supportata dal tuo browser.');
    }
  };

  // Al primo avvio proviamo subito a usare il GPS, come fanno tutte le app concorrenti
  const didAutoLocate = useRef(false);
  useEffect(() => {
    if (didAutoLocate.current) return;
    didAutoLocate.current = true;
    handleLocateMe({ silent: true });
  }, []);

  // Real OpenStreetMap Nominatim Live Geocoding with addressdetails=1
  const handleSearchLocation = async (query) => {
    trackAdAction();
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

  // Unisce i dati ufficiali con i contributi locali dell'utente, poi filtra e ordina
  const processedStations = useMemo(() => {
    let list = stations.map(st => {
      const ov = overlays[st.id] || {};
      const reviews = ov.reviews || [];
      const rating = reviews.length ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length * 10) / 10 : null;
      return {
        ...st,
        prices: { ...st.prices, ...(ov.prices || {}) },
        userReported: !!ov.prices,
        reviews,
        reviewsCount: reviews.length,
        rating,
        amenities: st.open24 ? ['open24'] : []
      };
    });

    if (selectedCountry !== 'ALL') {
      list = list.filter(st => st.country === selectedCountry);
    }

    // I gestori a volte comunicano prezzi errati (es. 1.169 invece di 2.169): un prezzo molto sotto
    // la mediana della zona viene segnalato come anomalo ed escluso dal badge "più conveniente"
    const values = list.map(st => getPrice(st, selectedFuelType, selectedServiceMode)).filter(v => v != null).sort((a, b) => a - b);
    const median = values.length ? values[Math.floor(values.length / 2)] : null;
    const isSuspect = val => val != null && median != null && values.length >= 5 && val < median * 0.85;
    // Un prezzo fermo da giorni non è affidabile: non può vincere il badge né stare in cima
    const isOld = st => isStale(st.prices[selectedFuelType]?.updatedAt || st.updatedAt);

    // Min/max del set filtrato per i badge "più conveniente" / "più caro"
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (const st of list) {
      const val = getPrice(st, selectedFuelType, selectedServiceMode);
      if (val == null || isSuspect(val) || isOld(st)) continue;
      if (val < minPrice) minPrice = val;
      if (val > maxPrice) maxPrice = val;
    }

    list = list.map(st => {
      const val = getPrice(st, selectedFuelType, selectedServiceMode);
      return {
        ...st,
        currentPrice: val,
        priceSuspect: isSuspect(val),
        priceOld: isOld(st),
        isCheapest: val != null && val === minPrice,
        isExpensive: val != null && val === maxPrice && maxPrice !== minPrice
      };
    });

    // Ordinamento: i distributori senza il carburante scelto vanno in fondo
    list.sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'rating') return (b.rating ?? -1) - (a.rating ?? -1) || a.distanceKm - b.distanceKm;
      if (a.priceSuspect !== b.priceSuspect) return a.priceSuspect ? 1 : -1;
      if (a.priceOld !== b.priceOld) return a.priceOld ? 1 : -1;
      return (a.currentPrice ?? Infinity) - (b.currentPrice ?? Infinity) || a.distanceKm - b.distanceKm;
    });

    return list;
  }, [stations, overlays, selectedCountry, selectedFuelType, selectedServiceMode, sortBy]);

  // Segnalazione prezzo dell'utente (salvata sul dispositivo)
  const handleUpdatePrice = (stationId, fuelType, serviceMode, priceVal) => {
    setOverlays(prev => {
      const ov = prev[stationId] || {};
      const base = stations.find(s => s.id === stationId)?.prices?.[fuelType] || { self: null, served: null };
      const prevFuel = ov.prices?.[fuelType] || base;
      return {
        ...prev,
        [stationId]: {
          ...ov,
          prices: {
            ...(ov.prices || {}),
            [fuelType]: { ...prevFuel, [serviceMode]: priceVal, updatedAt: new Date().toISOString() }
          }
        }
      };
    });
    setUserPoints(pts => pts + 50);
  };

  const handleAddReview = (stationId, newReview) => {
    setOverlays(prev => {
      const ov = prev[stationId] || {};
      return { ...prev, [stationId]: { ...ov, reviews: [newReview, ...(ov.reviews || [])] } };
    });
  };

  // Il drawer deve riflettere le modifiche (nuova recensione, prezzo segnalato)
  const selectedStationLive = selectedStation
    ? processedStations.find(s => s.id === selectedStation.id) || selectedStation
    : null;

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
        onOpenTripCalc={() => openFeature('tripCalculator')}
        onOpenTrends={() => openFeature('priceStats')}
        onOpenMonetizationInfo={() => setIsProOpen(true)}
      />

      {/* Main Grid Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Left Column: Interactive Map View (7 cols on desktop) */}
        <section className="lg:col-span-7 h-[420px] lg:h-[calc(100vh-140px)] sticky top-20">
          <MapComponent
            userLocation={userLocation}
            stations={processedStations}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
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
            dataStatus={dataStatus}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
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
        station={selectedStationLive}
        onClose={() => setSelectedStation(null)}
        onOpenReportModal={(st) => setReportTargetStation(st)}
        onOpenReviewModal={(st) => setReviewTargetStation(st)}
        currentLang={currentLang}
      />

      {/* Trip Cost Calculator Modal */}
      <TripCalculatorModal
        isOpen={isTripCalcOpen}
        onClose={() => setIsTripCalcOpen(false)}
        stations={processedStations}
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
        stations={processedStations}
        selectedServiceMode={selectedServiceMode}
        currentLang={currentLang}
      />

      {/* FuelSaver Pro (acquisto una tantum, niente pubblicità) */}
      <ProModal
        isOpen={isProOpen}
        onClose={() => setIsProOpen(false)}
        currentLang={currentLang}
      />

      {/* Funzione premium bloccata: video premio o Pro */}
      <PremiumGateModal
        feature={gatedFeature}
        onClose={() => setGatedFeature(null)}
        onUnlocked={(feature) => {
          setGatedFeature(null);
          openFeature(feature);
        }}
        onOpenPro={() => {
          setGatedFeature(null);
          setIsProOpen(true);
        }}
        currentLang={currentLang}
      />

      {/* AdMob Banner Simulation Footer */}
      <AdBanner
        currentLang={currentLang}
        onUpgradePremium={() => setIsProOpen(true)}
      />

    </div>
  );
}
