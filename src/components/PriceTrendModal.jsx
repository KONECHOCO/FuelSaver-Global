import React, { useMemo } from 'react';
import { X, TrendingUp, PiggyBank } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { translations } from '../i18n/translations';
import { getPrice, formatPrice } from '../utils/price';

const FUELS = ['petrol', 'diesel', 'lpg', 'methane'];

// Statistiche calcolate sui prezzi ufficiali già caricati per la zona (nessun dato simulato).
// Lo storico reale richiede di salvare gli snapshot giornalieri lato backend.
export default function PriceTrendModal({ isOpen, onClose, stations, selectedServiceMode, currentLang }) {
  const t = translations[currentLang] || translations.en;

  const stats = useMemo(() => FUELS.map(fuel => {
    const values = stations.map(st => getPrice(st, fuel, selectedServiceMode)).filter(v => v != null);
    if (!values.length) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { fuel, label: t.fuelTypes[fuel], min, avg, max, count: values.length };
  }).filter(Boolean), [stations, selectedServiceMode, t]);

  if (!isOpen) return null;

  const main = stats[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-center overflow-y-auto [&>*]:my-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">{t.trends.title}</h2>
              <p className="text-xs text-slate-400">{t.trends.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {stats.length === 0 ? (
            <p className="text-sm text-slate-400 text-center">{t.data.noStations}</p>
          ) : (
            <>
              {main && main.max > main.min && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                  <PiggyBank className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-300 font-semibold leading-relaxed">
                    {main.label}: {t.trends.fullTankSaving.replace('{x}', `€${((main.max - main.min) * 50).toFixed(2)}`)}
                  </p>
                </div>
              )}

              <div className="h-64 w-full bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => v.toFixed(2)} />
                    <Tooltip
                      formatter={v => formatPrice(v)}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="min" name={t.trends.min} fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avg" name={t.trends.avg} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="max" name={t.trends.max} fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <span />
                <span className="text-emerald-400 font-bold text-right">{t.trends.min}</span>
                <span className="text-blue-400 font-bold text-right">{t.trends.avg}</span>
                <span className="text-rose-400 font-bold text-right">{t.trends.max}</span>
                {stats.map(s => (
                  <React.Fragment key={s.fuel}>
                    <span className="text-slate-300 font-semibold">{s.label} <span className="text-slate-500">({s.count})</span></span>
                    <span className="text-right text-slate-200">{formatPrice(s.min)}</span>
                    <span className="text-right text-slate-200">{formatPrice(s.avg)}</span>
                    <span className="text-right text-slate-200">{formatPrice(s.max)}</span>
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
