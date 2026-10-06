import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { X, Sparkles, Check, MapPin } from 'lucide-react';
import useCompareStore from '../store/compareStore';
import soundFX from '../utils/soundEffects';
import fireGoldConfetti from '../utils/confetti';

// Compute realistic radar metrics based on category & measurements
function getRadarAttributes(talent) {
  const cat = (talent.category || '').toLowerCase();
  const height = talent.heightCm || 178;
  const isRunway = cat === 'runway';
  const isEditorial = cat === 'editorial';
  const isPageant = cat === 'pageant';

  return [
    { attribute: 'Runway Stride', value: isRunway ? 96 : height >= 180 ? 90 : 78 },
    { attribute: 'Editorial Poise', value: isEditorial ? 95 : 84 },
    { attribute: 'Commercial Charm', value: cat === 'commercial' ? 98 : isPageant ? 90 : 82 },
    { attribute: 'Pageant Elegance', value: isPageant ? 98 : 80 },
    { attribute: 'Proportion Ratio', value: height >= 177 ? 92 : 85 },
    { attribute: 'Camera Affinity', value: talent.isVerified ? 94 : 88 },
  ];
}

const TALENT_COLORS = [
  { stroke: '#d4af37', fill: '#d4af37', text: 'text-amber-400', name: 'Model A' },
  { stroke: '#06b6d4', fill: '#06b6d4', text: 'text-cyan-400', name: 'Model B' },
  { stroke: '#f43f5e', fill: '#f43f5e', text: 'text-rose-400', name: 'Model C' },
];

export default function CompareDock() {
  const { selectedTalents, removeTalent, clearTalents, isComparing, openCompare, closeCompare } =
    useCompareStore();

  if (selectedTalents.length === 0) return null;

  // Combine radar data across selected talents
  const radarAttributes = [
    'Runway Stride',
    'Editorial Poise',
    'Commercial Charm',
    'Pageant Elegance',
    'Proportion Ratio',
    'Camera Affinity',
  ];
  const chartData = radarAttributes.map((attr, idx) => {
    const entry = { attribute: attr };
    selectedTalents.forEach((talent, tIdx) => {
      const attrs = getRadarAttributes(talent);
      entry[`talent_${tIdx}`] = attrs[idx]?.value || 80;
    });
    return entry;
  });

  const handleShortlistAll = () => {
    soundFX.playCelebration();
    fireGoldConfetti({ particleCount: 90 });
    alert(`Shortlisted ${selectedTalents.length} talents to current casting shortlist!`);
  };

  return (
    <>
      {/* Floating Bottom Compare Dock Bar */}
      {!isComparing && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92vw] bg-[#0d0e12]/95 backdrop-blur-2xl border border-amber-400/50 rounded-full px-5 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.25)] flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center -space-x-3">
              {selectedTalents.map((talent) => (
                <div key={talent.id || talent._id} className="relative group">
                  <img
                    src={
                      talent.thumbnailUrl ||
                      talent.photoUrl ||
                      'https://images.unsplash.com/photo-1536766768598-e09213fdcf22?q=80&w=200'
                    }
                    alt={talent.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-md"
                  />
                  <button
                    onClick={() => removeTalent(talent.id || talent._id)}
                    aria-label={`Remove ${talent.fullName} from comparison`}
                    title="Remove"
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-900 border border-white/20 rounded-full text-zinc-400 hover:text-white flex items-center justify-center text-[10px] opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="min-w-0 hidden sm:block">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold block">
                Compare Tray ({selectedTalents.length}/3)
              </span>
              <span className="text-[11px] text-zinc-400 truncate block">
                {selectedTalents.map((t) => t.fullName).join(', ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={clearTalents}
              className="text-xs font-mono text-zinc-400 hover:text-white px-2 py-1 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={openCompare}
              className="btn-gold !py-2 !px-4 !text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            >
              <Sparkles size={14} />
              <span>Head-to-Head Compare</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Full Screen Comparison Matrix Modal */}
      <AnimatePresence>
        {isComparing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0e0e12] border border-amber-400/40 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-[0_25px_90px_rgba(212,175,55,0.2)] p-6 sm:p-8 flex flex-col relative"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-6 border-b border-white/10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-widest mb-2">
                    <Sparkles size={12} /> Multidimensional Head-to-Head Matrix
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                    Talent{' '}
                    <span className="italic font-serif font-normal gold-gradient-text">
                      Comparison Studio
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light">
                    Evaluating physical editorial metrics and comparative attribute radar polygons.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleShortlistAll}
                    className="btn-gold !py-2 !px-4 !text-xs hidden sm:flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Shortlist Selected ({selectedTalents.length})</span>
                  </button>
                  <button
                    onClick={closeCompare}
                    aria-label="Close comparison"
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Main Content Grid: Profiles & Radar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-center">
                {/* Left: Multidimensional Radar Chart */}
                <div className="lg:col-span-6 bg-zinc-950/60 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col items-center">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-2">
                    Multidimensional Attribute Radar
                  </span>
                  <div className="w-full h-72 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={chartData}>
                        <PolarGrid stroke="#27272a" />
                        <PolarAngleAxis
                          dataKey="attribute"
                          tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'monospace' }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          stroke="#3f3f46"
                          tick={{ fill: '#71717a', fontSize: 9 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid #d4af37',
                            borderRadius: '12px',
                          }}
                          labelStyle={{
                            color: '#d4af37',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                          }}
                        />
                        {selectedTalents.map((talent, idx) => (
                          <Radar
                            key={talent.id || talent._id}
                            name={talent.fullName}
                            dataKey={`talent_${idx}`}
                            stroke={TALENT_COLORS[idx].stroke}
                            fill={TALENT_COLORS[idx].fill}
                            fillOpacity={0.25}
                          />
                        ))}
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-xs font-mono">
                    {selectedTalents.map((talent, idx) => (
                      <div key={talent.id || talent._id} className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: TALENT_COLORS[idx].stroke }}
                        />
                        <span className="text-zinc-300 font-medium">{talent.fullName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Comparative Stat Breakdown Cards */}
                <div className="lg:col-span-6 space-y-4">
                  <div className={`grid grid-cols-${selectedTalents.length} gap-4`}>
                    {selectedTalents.map((talent, idx) => (
                      <div
                        key={talent.id || talent._id}
                        className="bg-zinc-900/80 border rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden"
                        style={{ borderColor: `${TALENT_COLORS[idx].stroke}40` }}
                      >
                        <div
                          className="absolute top-0 inset-x-0 h-1"
                          style={{ backgroundColor: TALENT_COLORS[idx].stroke }}
                        />
                        <img
                          src={
                            talent.thumbnailUrl ||
                            talent.photoUrl ||
                            'https://images.unsplash.com/photo-1536766768598-e09213fdcf22?q=80&w=400'
                          }
                          alt={talent.fullName}
                          className="w-20 h-24 object-cover rounded-xl border border-white/10 mb-3 shadow-lg"
                        />
                        <h4 className="font-semibold text-white text-sm truncate max-w-full">
                          {talent.fullName}
                        </h4>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-300 mt-1">
                          {talent.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1">
                          <MapPin size={10} className="text-amber-400" />
                          <span>{talent.country || 'International'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Attribute Comparison Table */}
                  <div className="bg-zinc-950/80 rounded-2xl border border-white/10 p-4 font-mono text-xs space-y-2.5">
                    <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-zinc-400">
                      <span className="text-[11px] uppercase tracking-wider">Height (cm)</span>
                      <div className="flex gap-6 text-right">
                        {selectedTalents.map((t, idx) => (
                          <span key={idx} className="font-bold text-white min-w-[60px]">
                            {t.heightCm ? `${t.heightCm} cm` : '—'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-zinc-400">
                      <span className="text-[11px] uppercase tracking-wider">Bust-Waist-Hips</span>
                      <div className="flex gap-6 text-right">
                        {selectedTalents.map((t, idx) => (
                          <span key={idx} className="font-bold text-white min-w-[60px]">
                            {t.measurements?.bust && t.measurements?.waist && t.measurements?.hips
                              ? `${t.measurements.bust}-${t.measurements.waist}-${t.measurements.hips}`
                              : '—'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1.5 text-zinc-400">
                      <span className="text-[11px] uppercase tracking-wider">Accreditation</span>
                      <div className="flex gap-6 text-right">
                        {selectedTalents.map((t, idx) => (
                          <span key={idx} className="text-amber-400 font-bold min-w-[60px]">
                            {t.isVerified ? '✓ Verified' : 'Standard'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-zinc-500 font-mono">
                  Comparative analysis powered by Atelier Multi-Dimensional Engine
                </span>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={clearTalents}
                    className="w-full sm:w-auto px-4 py-2 border border-white/10 text-xs font-mono uppercase rounded-full text-zinc-400 hover:text-white transition-colors"
                  >
                    Clear Tray
                  </button>
                  <button
                    onClick={handleShortlistAll}
                    className="w-full sm:w-auto btn-gold !py-2.5 !px-6 !text-xs flex items-center justify-center gap-2"
                  >
                    <Check size={14} />
                    <span>Confirm Shortlist Selection</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
