import React, { useState } from 'react';
import { Gift, Check, Loader2 } from 'lucide-react';
import { translations } from '../i18n/translations';
import { useReferral, setCode, canEnterCode } from '../services/referral';

/** Campo "Hai un codice invito?" (programma ambasciatori). Non mostra nulla se non serve. */
export default function ReferralCodeForm({ currentLang, compact = false }) {
  const t = (translations[currentLang] || translations.en).referral;
  const ref = useReferral();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!ref.enabled) return null;

  if (ref.code) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2.5 text-sm text-emerald-200">
        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{t.applied} <b className="font-mono tracking-wider text-white">{ref.code}</b></span>
      </div>
    );
  }
  if (!canEnterCode(ref)) {
    return compact ? null : <p className="text-xs text-slate-500">{t.expired}</p>;
  }

  const submit = async e => {
    e.preventDefault();
    if (!value.trim() || busy) return;
    setBusy(true);
    setError('');
    const res = await setCode(value);
    setBusy(false);
    if (res !== 'ok') setError(t[res] || t.invalid);
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      {!compact && (
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Gift className="w-4 h-4 text-emerald-400" />
          {t.title}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={value}
          onChange={e => { setValue(e.target.value.toUpperCase()); setError(''); }}
          placeholder={t.placeholder}
          maxLength={20}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 min-w-0 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm font-mono tracking-wider text-white placeholder:text-slate-500 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={busy || !value.trim()}
          className="px-4 rounded-xl bg-emerald-500 text-slate-950 text-sm font-black disabled:opacity-40 active:scale-95 transition-all flex items-center"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t.apply}
        </button>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {!compact && <p className="text-[11px] text-slate-500 leading-relaxed">{t.hint}</p>}
    </form>
  );
}
