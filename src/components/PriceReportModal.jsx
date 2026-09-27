import React, { useState } from 'react';
import { X, Fuel, Edit3, Award, Camera, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { translations } from '../i18n/translations';

export default function PriceReportModal({ isOpen, onClose, station, onUpdatePrice, currentLang }) {
  const [fuelType, setFuelType] = useState('petrol');
  const [serviceMode, setServiceMode] = useState('self');
  const [priceInput, setPriceInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const t = translations[currentLang] || translations.en;

  if (!isOpen || !station) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericPrice = parseFloat(priceInput);
    if (isNaN(numericPrice) || numericPrice <= 0) return;

    onUpdatePrice(station.id, fuelType, serviceMode, numericPrice);
    
    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setPriceInput('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">{t.modalReport.title}</h2>
              <p className="text-xs text-slate-400">{station.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-white">{t.modalReport.successMsg}</h3>
            <p className="text-xs text-amber-400 font-bold flex items-center justify-center gap-1">
              <Award className="w-4 h-4 animate-bounce" />
              <span>+50 FuelSaver Points!</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Gamification Callout */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-300 font-medium leading-tight">
                {t.modalReport.subtitle}
              </p>
            </div>

            {/* Select Fuel Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{t.modalReport.selectFuel}</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="petrol">{t.fuelTypes.petrol}</option>
                <option value="diesel">{t.fuelTypes.diesel}</option>
                <option value="lpg">{t.fuelTypes.lpg}</option>
                <option value="methane">{t.fuelTypes.methane}</option>
                <option value="ev">{t.fuelTypes.ev}</option>
              </select>
            </div>

            {/* Service Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Modalità Servizio</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setServiceMode('self')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    serviceMode === 'self' 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-slate-950 border border-slate-800 text-slate-400'
                  }`}
                >
                  Self Service
                </button>

                <button
                  type="button"
                  onClick={() => setServiceMode('served')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    serviceMode === 'served' 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-slate-950 border border-slate-800 text-slate-400'
                  }`}
                >
                  Servito
                </button>
              </div>
            </div>

            {/* Price Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{t.modalReport.enterPrice}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">€</span>
                <input
                  type="number"
                  step="0.001"
                  placeholder="1.729"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-base font-extrabold text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Photo optional placeholder */}
            <div className="p-3 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-slate-400 text-xs font-medium cursor-pointer hover:bg-slate-950/40">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>{t.modalReport.photoOptional}</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <span>{t.modalReport.submit}</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
