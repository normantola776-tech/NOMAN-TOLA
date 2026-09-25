import React from 'react';
import { Sparkles, Check, X, Compass, Image as ImageIcon } from 'lucide-react';
import { STUDY_ATMOSPHERES, StudyAtmosphere } from '../data/studyAtmospheres.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedId: string;
  onSelect: (atmosphere: StudyAtmosphere) => void;
}

export const StudyAtmosphereSelector: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedId,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Choose Your Study Concentration Atmosphere</h3>
              <p className="text-xs text-slate-400">
                Immersive photographic backdrops curated from top Ugandan & global academic sanctuaries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Environments */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 divide-y divide-slate-800/60">
          {STUDY_ATMOSPHERES.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className={`pt-3.5 first:pt-0 cursor-pointer group flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-3 rounded-2xl transition-all ${
                  isSelected
                    ? 'bg-blue-600/15 border border-blue-500/40'
                    : 'hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {/* Visual Thumbnail */}
                <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                      {item.name}
                    </h4>
                  </div>
                  <p className="text-xs text-blue-400 font-medium">{item.institution}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.tagline}</p>
                  <p className="text-[10px] text-amber-300 italic pt-0.5">
                    {item.focusQuote} <span className="text-slate-400">— {item.quoteAuthor}</span>
                  </p>
                </div>

                {/* Selection button */}
                <div className="shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(item);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Applied' : 'Select Atmosphere'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Atmosphere persists in your browser profile for deep concentration</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
