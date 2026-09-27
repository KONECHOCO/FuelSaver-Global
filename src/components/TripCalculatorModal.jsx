import React, { useState } from 'react';
import { X, Navigation, Fuel, DollarSign, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function TripCalculatorModal({ isOpen, onClose, stations, currentLang }) {
  const [origin, setOrigin] = useState('Roma');
  const [destination, setDestination] = useState('Milano');
  const [consumption, setConsumption] = useState(6.5); // L/100km
  const [fuelType, setFuelType] = useState('petrol');
  const [result, setResult] = useState(null);

  const t = translations[currentLang] || translations.en;

  if (!isOpen) return null;

  const handleCalculate = (e) => {
    e.preventDefault();
    
    // Simple calculations for demo
    const distanceKm = 570; 
    const litersNeeded = (distanceKm / 100) * consumption;
    
    // Find cheapest station in array
    const bestStation = stations.reduce((prev, curr) => {
      const pPrev = prev.prices[fuelType]?.self || 99;
      const pCurr = curr.prices[fuelType]?.self || 99;
      return pCurr < pPrev ? curr : prev;
    }, stations[0]);

    const pricePerL = bestStation.prices[fuelType]?.self || 1.72;
    const totalCost = litersNeeded * pricePerL;
    const avgHighwayPrice = pricePerL + 0.18; // Highway penalty
    const totalHighwayCost = litersNeeded * avgHighwayPrice;
    const savings = totalHighwayCost - totalCost;

    setResult({
      distanceKm,
      litersNeeded: litersNeeded.toFixed(1),
      totalCost: totalCost.toFixed(2),
      savings: savings.toFixed(2),
      bestStation
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">{t.tripCalculator.title}</h2>
              <p className="text-xs text-slate-400">{t.tripCalculator.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleCalculate} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{t.tripCalculator.origin}</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{t.tripCalculator.destination}</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{t.tripCalculator.consumption}</label>
              <input
                type="number"
                step="0.1"
                value={consumption}
                onChange={(e) => setConsumption(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{t.modalReport.selectFuel}</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="petrol">{t.fuelTypes.petrol}</option>
                <option value="diesel">{t.fuelTypes.diesel}</option>
                <option value="lpg">{t.fuelTypes.lpg}</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.tripCalculator.calculateBtn}</span>
          </button>

        </form>

        {/* Result Area */}
        {result && (
          <div className="p-5 border-t border-slate-800 bg-slate-950/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">{t.tripCalculator.resultTitle}:</span>
              <span className="text-xs text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                🎉 {t.tripCalculator.savingsMsg} €{result.savings}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 block">{t.tripCalculator.estimatedCost}</span>
                <span className="text-2xl font-black text-white">€{result.totalCost}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Distanza & Carburante</span>
                <span className="text-xs font-bold text-slate-200">{result.distanceKm} km ({result.litersNeeded} Litri)</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t.tripCalculator.recommendedStation}:
              </span>
              <p className="font-extrabold text-white text-sm">{result.bestStation.name}</p>
              <p className="text-slate-400 text-[11px]">{result.bestStation.address}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
