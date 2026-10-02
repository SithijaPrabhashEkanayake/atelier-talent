import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Calculator, X, Clock, Users, FileDown } from 'lucide-react';
import useCompareStore from '../store/compareStore';
import soundFX from '../utils/soundEffects';
import fireGoldConfetti from '../utils/confetti';

const TALENT_TIERS = [
  {
    id: 'emerging',
    label: 'Emerging Face',
    rate: 850,
    desc: 'Fresh faces, catalog & social shoots',
  },
  {
    id: 'editorial',
    label: 'Editorial Pro',
    rate: 2400,
    desc: 'Magazine features & campaign looks',
  },
  {
    id: 'runway',
    label: 'International Runway',
    rate: 5800,
    desc: 'Paris/Milan FW, lead lookbook',
  },
  {
    id: 'couture',
    label: 'Haute Couture Lead',
    rate: 12500,
    desc: 'Global titleholders & marquee stars',
  },
];

const USAGE_RIGHTS = [
  {
    id: 'digital',
    label: 'Digital & Social',
    mult: 1.0,
    desc: 'Web lookbook & organic social (1 yr)',
  },
  {
    id: 'print',
    label: 'Editorial Print',
    mult: 1.4,
    desc: 'Magazines, catalogs & press kit (1 yr)',
  },
  {
    id: 'billboard',
    label: 'Global Outdoor / OOH',
    mult: 2.2,
    desc: 'Billboards, transit & retail POS (1 yr)',
  },
  {
    id: 'broadcast',
    label: 'Worldwide TV & Video',
    mult: 3.0,
    desc: 'Global commercials & streaming (2 yrs)',
  },
];

const PIE_COLORS = ['#d4af37', '#06b6d4', '#f43f5e', '#a855f7'];

export default function BudgetCalculatorModal() {
  const { isBudgetModalOpen, closeBudgetModal } = useCompareStore();

  const [modelCount, setModelCount] = useState(2);
  const [shootDays, setShootDays] = useState(2);
  const [selectedTier, setSelectedTier] = useState(TALENT_TIERS[1]);
  const [selectedUsage, setSelectedUsage] = useState(USAGE_RIGHTS[0]);
  const [includeGlam, setIncludeGlam] = useState(true);
  const [includeStylist, setIncludeStylist] = useState(true);
  const [includeStudio, setIncludeStudio] = useState(false);

  if (!isBudgetModalOpen) return null;

  // Calculation logic
  const baseTalentFee = modelCount * shootDays * selectedTier.rate;
  const licensingFee = Math.round(baseTalentFee * (selectedUsage.mult - 1));
  const glamCost = includeGlam ? 1200 * shootDays : 0;
  const stylistCost = includeStylist ? 1500 * shootDays : 0;
  const studioCost = includeStudio ? 2200 * shootDays : 0;
  const productionCost = glamCost + stylistCost + studioCost;
  const subtotal = baseTalentFee + licensingFee + productionCost;
  const agencyCommission = Math.round(subtotal * 0.15);
  const totalBudget = subtotal + agencyCommission;

  const breakdownData = [
    { name: 'Talent Fees', value: baseTalentFee },
    { name: 'Licensing', value: licensingFee },
    { name: 'Production / Glam', value: productionCost },
    { name: 'Agency Service (15%)', value: agencyCommission },
  ].filter((item) => item.value > 0);

  const handleExport = () => {
    soundFX.playCelebration();
    fireGoldConfetti({ particleCount: 80 });
    alert(
      `Production Budget Spec Generated: $${totalBudget.toLocaleString()} USD across ${modelCount} models and ${shootDays} days.`,
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-[#0e0e12] border border-amber-400/40 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-[0_25px_90px_rgba(212,175,55,0.25)] p-6 sm:p-8 flex flex-col relative"
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-widest mb-2">
                <Calculator size={12} /> Casting Economics Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Couture Production{' '}
                <span className="italic font-serif font-normal gold-gradient-text">
                  Budget Estimator
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light">
                Calibrate shoot days, licensing rights, talent tiers, and glam crew to forecast
                production budgets.
              </p>
            </div>

            <button
              onClick={closeBudgetModal}
              aria-label="Close budget calculator"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Interactive Sliders & Options */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
            {/* Left Controls Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Sliders: Models & Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1">
                      <Users size={12} /> Models Needed
                    </span>
                    <span className="text-base font-bold text-amber-300 font-mono">
                      {modelCount}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={modelCount}
                    onChange={(e) => {
                      setModelCount(Number(e.target.value));
                      soundFX.playTick();
                    }}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-1">
                    <span>1 Solo</span>
                    <span>5 Campaign</span>
                    <span>10 Runway</span>
                  </div>
                </div>

                <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1">
                      <Clock size={12} /> Shoot Duration
                    </span>
                    <span className="text-base font-bold text-amber-300 font-mono">
                      {shootDays} {shootDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={shootDays}
                    onChange={(e) => {
                      setShootDays(Number(e.target.value));
                      soundFX.playTick();
                    }}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-1">
                    <span>1 Day</span>
                    <span>3 Days</span>
                    <span>7 Days</span>
                  </div>
                </div>
              </div>

              {/* Talent Tier Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-2.5">
                  Talent Accreditation Tier
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {TALENT_TIERS.map((tier) => {
                    const active = selectedTier.id === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => {
                          setSelectedTier(tier);
                          soundFX.playTick();
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          active
                            ? 'bg-amber-400/15 border-amber-400 text-white shadow-lg'
                            : 'bg-zinc-950/50 border-white/10 hover:border-white/20 text-zinc-400'
                        }`}
                      >
                        <div className="flex justify-between items-center font-medium text-xs">
                          <span className={active ? 'text-amber-300 font-bold' : 'text-zinc-200'}>
                            {tier.label}
                          </span>
                          <span className="font-mono text-amber-400 text-[11px]">
                            ${tier.rate}/d
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{tier.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Usage Rights Scope */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-2.5">
                  Licensing & Buyout Scope
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {USAGE_RIGHTS.map((usage) => {
                    const active = selectedUsage.id === usage.id;
                    return (
                      <div
                        key={usage.id}
                        onClick={() => {
                          setSelectedUsage(usage);
                          soundFX.playTick();
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          active
                            ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg'
                            : 'bg-zinc-950/50 border-white/10 hover:border-white/20 text-zinc-400'
                        }`}
                      >
                        <div className="flex justify-between items-center font-medium text-xs">
                          <span className={active ? 'text-cyan-300 font-bold' : 'text-zinc-200'}>
                            {usage.label}
                          </span>
                          <span className="font-mono text-cyan-400 text-[11px]">{usage.mult}x</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{usage.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Production Crew Add-ons */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold mb-2">
                  Glam & Production Add-ons
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIncludeGlam(!includeGlam);
                      soundFX.playTick();
                    }}
                    aria-pressed={includeGlam}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${
                      includeGlam
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 font-bold'
                        : 'bg-white/5 text-zinc-400 border-white/10'
                    }`}
                  >
                    {includeGlam ? '✓ ' : '+ '}Hair & Makeup Team ($1.2k/d)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIncludeStylist(!includeStylist);
                      soundFX.playTick();
                    }}
                    aria-pressed={includeStylist}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${
                      includeStylist
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 font-bold'
                        : 'bg-white/5 text-zinc-400 border-white/10'
                    }`}
                  >
                    {includeStylist ? '✓ ' : '+ '}Wardrobe Stylist ($1.5k/d)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIncludeStudio(!includeStudio);
                      soundFX.playTick();
                    }}
                    aria-pressed={includeStudio}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${
                      includeStudio
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 font-bold'
                        : 'bg-white/5 text-zinc-400 border-white/10'
                    }`}
                  >
                    {includeStudio ? '✓ ' : '+ '}High-Key Studio ($2.2k/d)
                  </button>
                </div>
              </div>
            </div>

            {/* Right Summary & Interactive Breakdown Chart */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              {/* Grand Total Display */}
              <div className="bg-gradient-to-br from-amber-400/15 via-zinc-950 to-zinc-950 border border-amber-400/40 rounded-3xl p-6 text-center shadow-xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold block mb-1">
                  Estimated Total Budget
                </span>
                <div className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
                  ${totalBudget.toLocaleString()}
                  <span className="text-xs font-mono text-zinc-400 font-normal ml-1">USD</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-2 font-mono">
                  Includes 15% agency commission & contingencies
                </p>
              </div>

              {/* Donut Chart Breakdown */}
              <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold mb-2">
                  Budget Allocation Breakdown
                </span>
                <div className="w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={breakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {breakdownData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => `$${Number(val).toLocaleString()}`}
                        contentStyle={{
                          backgroundColor: '#18181b',
                          border: '1px solid #d4af37',
                          borderRadius: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full text-[11px] font-mono mt-1">
                  {breakdownData.map((item, idx) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-zinc-400"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-white shrink-0 ml-1">
                        ${item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleExport}
                className="btn-gold !py-3 w-full !text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(212,175,55,0.35)]"
              >
                <FileDown size={15} />
                <span>Export Budget Spec / Attach to Casting</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
