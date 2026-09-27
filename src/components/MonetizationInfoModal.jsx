import React from 'react';
import { X, Smartphone, DollarSign, ShieldCheck, CheckCircle2, Copy, Sparkles } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function MonetizationInfoModal({ isOpen, onClose, currentLang }) {
  const t = translations[currentLang] || translations.en;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">{t.monetization.infoModalTitle}</h2>
              <p className="text-xs text-slate-400">Guida completa per la pubblicazione su App Store & Play Store</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 no-scrollbar text-xs">
          
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-2">
            <h3 className="font-extrabold text-sm text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              1. Modello di Monetizzazione Multi-Canale Integrato
            </h3>
            <ul className="list-disc list-inside text-slate-300 space-y-1 leading-relaxed">
              <li><b>AdMob Banner & Interstitial:</b> Banner fisso in basso e pubblicità a tutto schermo al salvataggio prezzo/percorso.</li>
              <li><b>Stazioni Sponsorizzate (Pins Dorati):</b> I brand di distributori pagano un canone per mettere in evidenza la loro stazione con coupon sconto.</li>
              <li><b>FuelSaver Premium (In-App Purchases):</b> Rimuove gli annunci pubblicitari, attiva il navigatore percorsi avanzato e gli avvisi prezzo.</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              2. Pubblicazione su App Store & Google Play Store
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Questo progetto è sviluppato in architettura cross-platform pronta per il compilatore <b>Capacitor</b> o <b>React Native</b>:
            </p>
            <div className="bg-slate-900 p-3 rounded-xl font-mono text-[11px] text-slate-300 space-y-1">
              <p># 1. Installa Capacitor per generare i progetti nativi iOS e Android:</p>
              <p className="text-emerald-400">npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios</p>
              <p className="text-emerald-400">npx cap init FuelSaver com.fuelsaver.app</p>
              <p className="text-emerald-400">npx cap add android</p>
              <p className="text-emerald-400">npx cap add ios</p>
              <p># 2. Per aggiungere Google AdMob nativo:</p>
              <p className="text-emerald-400">npm install @capacitor-community/admob</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              3. Fonti Dati Ufficiali Open Data (Gratuiti & Integrabili)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="font-bold text-white">🇮🇹 Italia (MIMIT)</span>
                <p className="text-slate-400">Osservaprezzi Carburanti Open Data API</p>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="font-bold text-white">🇩🇪 Germania (Tankerkoenig)</span>
                <p className="text-slate-400">Tankerkoenig API v2 (E5, E10, Diesel)</p>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="font-bold text-white">🇪🇸 Spagna (MITECO)</span>
                <p className="text-slate-400">Geoportal Gasolineras REST Service</p>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="font-bold text-white">🇬🇧 UK (CMA Standard)</span>
                <p className="text-slate-400">Open Fuel Data Scheme</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
