import React from 'react';
import { X, Star, Shield, FileText, BookOpen, Mail, Info } from 'lucide-react';
import { translations } from '../i18n/translations';
import { rateApp, openExternal, PRIVACY_URL, TERMS_URL, APP_VERSION } from '../services/appInfo';

export default function InfoModal({ isOpen, onClose, onShowTutorial, currentLang }) {
  const t = (translations[currentLang] || translations.en).info;

  if (!isOpen) return null;

  const items = [
    { icon: BookOpen, label: t.tutorial, action: () => { onClose(); onShowTutorial(); } },
    { icon: Shield, label: t.privacy, action: () => openExternal(PRIVACY_URL) },
    { icon: FileText, label: t.terms, action: () => openExternal(TERMS_URL) },
    { icon: Mail, label: t.contact, action: () => openExternal('mailto:konechocoproduction@gmail.com?subject=FuelSaver') }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex justify-center overflow-y-auto [&>*]:my-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-black text-white">{t.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={rateApp}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-400/20 to-amber-500/10 border border-amber-500/40 text-left flex items-center gap-3 active:scale-[0.98] transition-all"
          >
            <Star className="w-7 h-7 text-amber-400 fill-amber-400 shrink-0" />
            <span>
              <span className="block text-sm font-black text-white">{t.rate}</span>
              <span className="block text-xs text-amber-100/80">{t.rateHint}</span>
            </span>
          </button>

          <div className="rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
            {items.map(({ icon: Icon, label, action }) => (
              <button key={label} onClick={action} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-slate-200 hover:bg-slate-800/60 text-left">
                <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                {label}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed px-2">
            {t.sources}
            <br />
            FuelSaver · {t.version} {APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  );
}
