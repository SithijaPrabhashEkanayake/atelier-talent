import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, MapPin, ArrowUpRight, Scale, Check } from 'lucide-react';
import useCompareStore from '../store/compareStore';

const categoryColors = {
  runway: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  editorial: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  commercial: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  pageant: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const PROFILE_ID = /^[a-f0-9]{24}$/;

export default function CompCard({ model, index = 0 }) {
  const { selectedTalents, addTalent } = useCompareStore();
  const navigate = useNavigate();

  if (!model) return null;

  const id = model.id || model._id;
  const hasProfile = PROFILE_ID.test(String(id || ''));
  const isSelected = selectedTalents.some((t) => (t.id || t._id) === id);

  const categoryStyle =
    categoryColors[model.category?.toLowerCase()] || 'bg-zinc-800 text-zinc-300 border-zinc-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      onClick={(e) => {
        if (!hasProfile) return;
        e.stopPropagation();
        navigate(`/p/${id}`);
      }}
      className={`group relative rounded-2xl overflow-hidden bg-zinc-900 border transition-all duration-500 flex flex-col shadow-xl ${hasProfile ? 'cursor-pointer' : ''} ${
        isSelected
          ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_30px_rgba(212,175,55,0.25)]'
          : 'border-white/10 hover:border-amber-400/40'
      }`}
    >
      {/* Aspect 3:4 Image Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950">
        {model.thumbnailUrl || model.photoUrl ? (
          <img
            src={model.thumbnailUrl || model.photoUrl}
            alt={`${model.fullName} - ${model.category} model`}
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 text-center">
            <span className="font-display italic text-6xl text-amber-400/30 mb-2">
              {model.fullName?.charAt(0) || 'M'}
            </span>
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">
              Portfolio Available
            </span>
          </div>
        )}

        {/* Ambient Gradient Shadows */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-black/30 pointer-events-none" />

        {/* Category Badge & Verification */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span
            className={`text-[10px] font-mono font-medium tracking-wider uppercase px-2.5 py-1 rounded-full border backdrop-blur-md ${categoryStyle}`}
          >
            {model.category || 'Talent'}
          </span>
          <div className="flex items-center gap-1.5">
            {model.isVerified && (
              <div className="flex items-center gap-1 bg-amber-400/90 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                <BadgeCheck size={12} />
                <span>VERIFIED</span>
              </div>
            )}
            {/* Quick Compare Pin */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addTalent(model);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                isSelected
                  ? 'bg-amber-400 text-zinc-950 shadow-md font-bold'
                  : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80'
              }`}
              title={isSelected ? 'Remove from compare tray' : 'Add to head-to-head comparison'}
            >
              {isSelected ? <Check size={12} /> : <Scale size={12} />}
            </button>
          </div>
        </div>

        {/* Hover Reveal: Editorial Measurements Drawer */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black via-black/90 to-transparent z-20">
          <div className="grid grid-cols-2 gap-2 text-center text-zinc-300 py-2 border-t border-white/10 font-mono text-xs">
            <div>
              <span className="block text-[9px] text-zinc-400 uppercase">Height</span>
              <span className="font-semibold text-white">
                {model.heightCm ? `${model.heightCm} cm` : '—'}
              </span>
            </div>
            <div>
              <span className="block text-[9px] text-zinc-400 uppercase">B-W-H</span>
              <span className="font-semibold text-white">
                {model.measurements?.bust && model.measurements?.waist && model.measurements?.hips
                  ? `${model.measurements.bust}-${model.measurements.waist}-${model.measurements.hips}`
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Information Footer */}
      <div className="p-4 bg-zinc-900/95 flex items-center justify-between z-10 border-t border-white/5">
        <div className="min-w-0 pr-2">
          <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors font-sans truncate">
            {model.fullName}
          </h3>
          <div className="flex items-center gap-1 text-xs text-zinc-400 mt-0.5">
            <MapPin size={11} className="text-amber-400/80 shrink-0" />
            <span className="truncate">{model.country || 'International'}</span>
            {model.derivedExperienceLevel && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="capitalize truncate">{model.derivedExperienceLevel}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addTalent(model);
            }}
            className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg border transition-all ${
              isSelected
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 font-bold'
                : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            {isSelected ? 'In Tray' : '+ Compare'}
          </button>

          <Link
            to={`/p/${id}`}
            onClick={(e) => e.stopPropagation()}
            className="h-8 w-8 rounded-full bg-white/5 hover:bg-amber-400 hover:text-zinc-950 text-zinc-300 flex items-center justify-center border border-white/10 transition-all"
            title="View Comp-Card & Portfolio"
          >
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
