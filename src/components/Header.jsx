import React, { useState } from 'react';
import {
  Fuel,
  MapPin,
  Globe,
  Search,
  Award,
  TrendingUp,
  Navigation,
  DollarSign,
  Loader2,
  Filter,
  Crown
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { useMonetization } from '../services/monetization';

export default function Header({
  currentLang,
  onLangChange,
  selectedCountry,
  onCountryChange,
  userPoints,
  onSearch,
  onLocate,
  onOpenTripCalc,
  onOpenTrends,
  onOpenMonetizationInfo
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const t = translations[currentLang] || translations.en;
  const { isPro } = useMonetization();

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      await onSearch(searchTerm);
      setIsSearching(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 shadow-xl pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]">
        <div className="flex items-center justify-between h-16 gap-2 min-w-0">

          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Fuel className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            {/* Su schermi stretti resta solo il logo: il nome farebbe sbordare l'intestazione */}
            <div className="hidden min-[400px]:block min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white truncate">{t.appName}</span>
              </div>
              <p className="hidden xl:block text-xs text-slate-400 font-medium">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Center Search Bar with Geocoding */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden sm:flex items-center gap-2">
            <div className="relative w-full">
              {isSearching ? (
                <Loader2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 animate-spin" />
              ) : (
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              )}
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
              />
            </div>
            <button
              type="button"
              onClick={onLocate}
              title={t.useMyLocation}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 shadow-md"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden xl:inline">{t.useMyLocation}</span>
            </button>
          </form>

          {/* Right Action Icons & Filters */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

            {/* Country Selector Filter */}
            <div className="hidden lg:flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
              <select
                value={selectedCountry}
                onChange={(e) => onCountryChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 pr-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-slate-100">🌍 Tutti i Paesi</option>
                <option value="IT" className="bg-slate-900 text-slate-100">🇮🇹 Italia</option>
                <option value="ES" className="bg-slate-900 text-slate-100">🇪🇸 Spagna</option>
                <option value="DE" className="bg-slate-900 text-slate-100">🇩🇪 Germania</option>
                <option value="FR" className="bg-slate-900 text-slate-100">🇫🇷 Francia</option>
              </select>
            </div>

            {/* Quick Action: Trip Calculator */}
            <button
              onClick={onOpenTripCalc}
              className="p-2 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all active:scale-95 shrink-0"
            >
              <Navigation className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden lg:inline">{t.actions.calculateTrip}</span>
            </button>

            {/* Quick Action: Price Trends */}
            <button
              onClick={onOpenTrends}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
              title={t.actions.priceTrends}
            >
              <TrendingUp className="w-4 h-4" />
            </button>

            {/* User Gamification Points */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-800/80 border border-amber-500/30 px-2.5 py-1 rounded-xl text-xs">
              <Award className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="font-bold text-amber-300">{userPoints}</span>
              <span className="text-[10px] text-slate-400 font-medium">PTS</span>
            </div>

            {/* FuelSaver Pro */}
            {!isPro && (
              <button
                onClick={onOpenMonetizationInfo}
                className="px-2 sm:px-2.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 transition-all"
                title={t.pro.title}
              >
                <Crown className="w-4 h-4" />
                <span>PRO</span>
              </button>
            )}

            {/* i18n Language Switcher */}
            <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5">
              <Globe className="hidden sm:block w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
              <select
                value={currentLang}
                onChange={(e) => onLangChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 pl-1.5 sm:pl-0 pr-1 sm:pr-2 py-1 focus:outline-none cursor-pointer uppercase"
              >
                <option value="it" className="bg-slate-900 text-slate-100">🇮🇹 IT</option>
                <option value="en" className="bg-slate-900 text-slate-100">🇬🇧 EN</option>
                <option value="es" className="bg-slate-900 text-slate-100">🇪🇸 ES</option>
                <option value="fr" className="bg-slate-900 text-slate-100">🇫🇷 FR</option>
                <option value="de" className="bg-slate-900 text-slate-100">🇩🇪 DE</option>
              </select>
            </div>

          </div>

        </div>

        {/* Mobile Search Bar (under header) */}
        <div className="pb-3 pt-1 sm:hidden flex flex-col gap-2">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative w-full">
              {isSearching ? (
                <Loader2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 animate-spin" />
              ) : (
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              )}
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={onLocate}
              className="p-2 bg-slate-800 text-emerald-400 border border-slate-700 rounded-xl text-xs font-semibold"
            >
              <MapPin className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </header>
  );
}
