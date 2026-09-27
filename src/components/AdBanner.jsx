import React, { useState } from 'react';
import { Smartphone, Zap, X, ShieldCheck } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function AdBanner({ currentLang, onUpgradePremium }) {
  const [closed, setClosed] = useState(false);
  const t = translations[currentLang] || translations.en;

  if (closed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md px-4 py-2 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded">
            ADMOB BANNER
          </div>
          <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span>{t.monetization.adBannerText}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onUpgradePremium}
            className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.monetization.removeAds}</span>
          </button>
          
          <button
            onClick={() => setClosed(true)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="Close banner preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
