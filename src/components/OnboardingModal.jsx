import React, { useState } from 'react';
import { BadgeCheck, TrendingDown, Navigation } from 'lucide-react';
import { translations } from '../i18n/translations';

const STEPS = [
  { icon: BadgeCheck, color: 'from-emerald-500 to-teal-400', title: 's1Title', text: 's1Text' },
  { icon: TrendingDown, color: 'from-amber-400 to-orange-500', title: 's2Title', text: 's2Text' },
  { icon: Navigation, color: 'from-blue-500 to-indigo-500', title: 's3Title', text: 's3Text' }
];

export default function OnboardingModal({ isOpen, onClose, currentLang }) {
  const [step, setStep] = useState(0);
  const t = (translations[currentLang] || translations.en).onboarding;

  if (!isOpen) return null;

  const finish = () => {
    setStep(0);
    onClose();
  };
  const last = step === STEPS.length - 1;
  const { icon: Icon, color, title, text } = STEPS[step];

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex justify-center overflow-y-auto [&>*]:my-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-end p-3">
          {!last && (
            <button onClick={finish} className="px-3 py-1 text-xs font-semibold text-slate-400 hover:text-white">
              {t.skip}
            </button>
          )}
        </div>

        <div className="px-6 pb-2 text-center">
          <div className={`mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-10 h-10 text-slate-950" />
          </div>
          <h2 className="mt-5 text-xl font-black text-white">{t[title]}</h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">{t[text]}</p>
        </div>

        <div className="flex justify-center gap-1.5 py-4">
          {STEPS.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-emerald-400' : 'w-1.5 bg-slate-700'}`} />
          ))}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={() => (last ? finish() : setStep(step + 1))}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm active:scale-95 transition-all"
          >
            {last ? t.start : t.next}
          </button>
        </div>
      </div>
    </div>
  );
}
