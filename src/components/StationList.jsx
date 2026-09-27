import React from 'react';
import {
  Fuel,
  Star,
  MapPin,
  Edit3,
  Clock,
  Coffee,
  Car,
  ShieldCheck,
  Zap,
  ChevronRight,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { formatPrice, formatAge, isStale, ageDays } from '../utils/price';

export default function StationList({
  stations,
  dataStatus,
  selectedStation,
  onSelectStation,
  selectedFuelType,
  onSelectFuelType,
  selectedServiceMode,
  onSelectServiceMode,
  sortBy,
  onSortChange,
  searchRadiusKm,
  onRadiusChange,
  onOpenReportModal,
  currentLang
}) {
  const t = translations[currentLang] || translations.en;

  const getAmenityIcon = (type) => {
    switch (type) {
      case 'coffee': return <Coffee className="w-3.5 h-3.5 text-amber-400" title={t.amenities.coffee} />;
      case 'wash': return <Car className="w-3.5 h-3.5 text-blue-400" title={t.amenities.wash} />;
      case 'open24': return <Clock className="w-3.5 h-3.5 text-emerald-400" title={t.amenities.open24} />;
      case 'ev': return <Zap className="w-3.5 h-3.5 text-purple-400" title={t.amenities.ev} />;
      default: return <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-lg overflow-hidden">

      {/* Top Controls Header */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/40">

        {/* Fuel Type Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['petrol', 'diesel', 'lpg', 'methane', 'ev'].map((fuelKey) => {
            const isActive = selectedFuelType === fuelKey;
            return (
              <button
                key={fuelKey}
                onClick={() => onSelectFuelType(fuelKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80'
                }`}
              >
                <Fuel className="w-3.5 h-3.5" />
                <span>{t.fuelTypes[fuelKey]}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Bar: Service Mode & Sort & Radius Slider */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">

          {/* Service Mode Toggle (Self vs Served) */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => onSelectServiceMode('self')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                selectedServiceMode === 'self' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400'
              }`}
            >
              {t.serviceMode.self}
            </button>
            <button
              onClick={() => onSelectServiceMode('served')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                selectedServiceMode === 'served' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400'
              }`}
            >
              {t.serviceMode.served}
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium">{t.sortBy}:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-2 py-1 font-bold focus:outline-none cursor-pointer"
            >
              <option value="price">{t.sortOptions.price}</option>
              <option value="distance">{t.sortOptions.distance}</option>
              <option value="rating">{t.sortOptions.rating}</option>
            </select>
          </div>

          {/* Search Radius Slider */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 border border-slate-800 rounded-xl">
            <span className="text-slate-400 font-medium">{t.radiusLabel}:</span>
            <input
              type="range"
              min="1"
              max="30"
              value={searchRadiusKm}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              className="w-16 accent-emerald-500 cursor-pointer"
            />
            <span className="font-bold text-emerald-400">{searchRadiusKm} km</span>
          </div>

        </div>

      </div>

      {/* Station Cards List Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
        {dataStatus?.loading && stations.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Loader2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 animate-spin" />
            <p className="font-semibold text-sm">{t.data.loading}</p>
          </div>
        ) : stations.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Fuel className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="font-semibold text-sm">
              {dataStatus?.error ? t.data.error : !dataStatus?.supported ? t.data.unsupported : t.data.noStations}
            </p>
          </div>
        ) : (
          stations.map((st) => {
            const isSelected = selectedStation?.id === st.id;
            const currentPrice = st.currentPrice;
            const fuelUpdatedAt = st.prices[selectedFuelType]?.updatedAt || st.updatedAt;
            const stale = isStale(fuelUpdatedAt);

            return (
              <div
                key={st.id}
                onClick={() => onSelectStation(st)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >

                {/* Station Top Bar: Tags & Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {st.isCheapest && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-md">
                        {t.cheapestTag}
                      </span>
                    )}

                    {st.isExpensive && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-md">
                        {t.expensiveTag}
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {st.distanceKm} km {t.distanceAway}
                    </span>
                  </div>

                  {/* Rating Stars (solo recensioni reali) */}
                  {st.rating != null && (
                    <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-slate-200">{st.rating}</span>
                      <span className="text-[10px] text-slate-500">({st.reviewsCount})</span>
                    </div>
                  )}
                </div>

                {/* Main Station Info & Large Price Tag */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                      {st.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{st.address}</p>

                    {st.priceSuspect && (
                      <p className="text-[11px] font-bold text-rose-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {t.data.suspect}
                      </p>
                    )}
                    {stale && (
                      <p className="text-[11px] font-bold text-amber-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {t.data.stale.replace('{n}', ageDays(fuelUpdatedAt))}
                      </p>
                    )}
                  </div>

                  {/* Price Box */}
                  <div className="text-right shrink-0">
                    <div className={`text-xl font-black tracking-tight ${stale || st.priceSuspect ? 'text-slate-400' : 'text-emerald-400'}`}>
                      {formatPrice(currentPrice)}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 block">
                      {t.serviceMode[selectedServiceMode]} · {formatAge(fuelUpdatedAt, t)}
                    </span>
                  </div>
                </div>

                {/* Footer info & Quick Action Buttons */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">

                  {/* Amenities Icons + fonte del dato */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1" title={t.data.officialSource}>
                      <ShieldCheck className="w-3 h-3 text-blue-400" />
                      {st.userReported ? t.updatedBy + ': ✓' : st.source}
                    </span>
                    {st.amenities.slice(0, 4).map((am, i) => (
                      <div key={i} className="p-1 bg-slate-900 rounded-md border border-slate-800">
                        {getAmenityIcon(am)}
                      </div>
                    ))}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReportModal(st);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Edit3 className="w-3 h-3 text-emerald-400" />
                      <span>{t.actions.updatePrice}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStation(st);
                      }}
                      className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 rounded-lg font-bold transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
