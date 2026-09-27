import React from 'react';
import {
  X,
  Fuel,
  Star,
  MapPin,
  Navigation,
  Edit3,
  Clock,
  Coffee,
  Car,
  ShieldCheck,
  MessageSquarePlus,
  CheckCircle2,
  Share2,
  Heart,
  ExternalLink
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { formatAge, formatPrice, isStale } from '../utils/price';

export default function StationDetailDrawer({
  station,
  onClose,
  onOpenReportModal,
  onOpenReviewModal,
  currentLang
}) {
  const t = translations[currentLang] || translations.en;

  if (!station) return null;

  const handleOpenNavigation = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col transition-all duration-300">

      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Fuel className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-slate-100">{t.drawer.title}</h2>
            <span className="text-[11px] text-slate-400 font-medium">{station.brand}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">

        {/* Main Station Banner */}
        <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-inner">
          <h1 className="text-lg font-black text-white">{station.name}</h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{station.address}</span>
          </p>

          <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-sm text-slate-100">{station.rating ?? t.data.noRating}</span>
              <span className="text-xs text-slate-500">({station.reviewsCount})</span>
            </div>

            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {t.lastUpdated} {formatAge(station.updatedAt, t)}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            {t.data.officialSource}: {station.source}
          </div>
        </div>

        {/* Quick Action Navigation Bar */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleOpenNavigation}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Navigation className="w-4 h-4 fill-slate-950" />
            <span>{t.actions.navigate}</span>
          </button>

          <button
            onClick={() => onOpenReportModal(station)}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>{t.actions.updatePrice}</span>
          </button>
        </div>

        {/* Complete Fuel Price List Table */}
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Fuel className="w-4 h-4 text-emerald-400" />
            <span>{t.drawer.priceListTitle}</span>
          </h3>

          <div className="space-y-2">
            {Object.entries(station.prices).map(([typeKey, priceObj]) => {
              if (!priceObj) return null;
              return (
                <div key={typeKey} className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-200 capitalize">{t.fuelTypes[typeKey] || typeKey}</span>
                    <span className={`block text-[10px] ${isStale(priceObj.updatedAt) ? 'text-amber-400' : 'text-slate-500'}`}>
                      {formatAge(priceObj.updatedAt, t)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {priceObj.self != null && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block uppercase">{t.serviceMode.self}</span>
                        <span className="font-black text-emerald-400 text-sm">{formatPrice(priceObj.self)}</span>
                      </div>
                    )}

                    {priceObj.served != null && (
                      <div className="text-right border-l border-slate-800 pl-3">
                        <span className="text-[10px] text-slate-500 block uppercase">{t.serviceMode.served}</span>
                        <span className="font-bold text-amber-400 text-sm">{formatPrice(priceObj.served)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {(station.extras || []).map((ex, i) => (
              <div key={`extra-${i}`} className="px-2.5 py-1.5 bg-slate-950/50 rounded-xl border border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{ex.label} · {ex.self ? t.serviceMode.self : t.serviceMode.served}</span>
                <span className="font-bold text-slate-300">{formatPrice(ex.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Feedback & Reviews Section */}
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              {t.drawer.reviewsTitle}
            </h3>

            <button
              onClick={() => onOpenReviewModal(station)}
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>{t.actions.writeReview}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {station.reviews.length === 0 && (
              <p className="text-xs text-slate-500">{t.drawer.noReviews}</p>
            )}
            {station.reviews.map((rev) => (
              <div key={rev.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{rev.user}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{rev.text}</p>
                <span className="text-[10px] text-slate-500 block">{rev.date}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
