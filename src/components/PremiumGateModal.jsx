import React, { useState } from 'react';
import { X, Lock, PlayCircle, Crown, Loader2 } from 'lucide-react';
import { translations } from '../i18n/translations';
import { unlockWithRewardedVideo } from '../services/monetization';

// Mostrato quando l'utente gratuito apre una funzione premium: video premio (24 h) oppure Pro
export default function PremiumGateModal({ feature, onClose, onUnlocked, onOpenPro, currentLang }) {
  const t = translations[currentLang] || translations.en;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  if (!feature) return null;

  const watch = async () => {
    setBusy(true);
    setMessage(null);
    const ok = await unlockWithRewardedVideo(feature);
    setBusy(false);
    if (ok) onUnlocked(feature);
    else setMessage(t.pro.videoUnavailable);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-white">{t.pro.lockedTitle}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-300">{t.pro.lockedText}</p>

        <button
          disabled={busy}
          onClick={watch}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
          {t.pro.watchVideo}
        </button>
        <button
          onClick={onOpenPro}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2"
        >
          <Crown className="w-4 h-4" />
          {t.pro.removeAds} · Pro
        </button>
        {message && <p className="text-xs text-center text-rose-300">{message}</p>}
      </div>
    </div>
  );
}
