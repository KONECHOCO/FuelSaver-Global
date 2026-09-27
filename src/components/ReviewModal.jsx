import React, { useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function ReviewModal({ isOpen, onClose, station, onAddReview, currentLang }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const t = translations[currentLang] || translations.en;

  if (!isOpen || !station) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    onAddReview(station.id, {
      user: "Utente_" + Math.floor(Math.random() * 900 + 100),
      rating,
      date: new Date().toISOString().split('T')[0],
      text: comment
    });

    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">{t.modalReview.title}</h2>
              <p className="text-xs text-slate-400">{station.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Star Rating selector */}
          <div className="text-center space-y-2">
            <label className="block text-xs font-bold text-slate-300">{t.modalReview.ratingLabel}</label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125"
                >
                  <Star className={`w-7 h-7 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Comment textarea */}
          <div>
            <textarea
              rows={4}
              placeholder={t.modalReview.commentPlaceholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <span>{t.modalReview.submit}</span>
          </button>

        </form>

      </div>
    </div>
  );
}
