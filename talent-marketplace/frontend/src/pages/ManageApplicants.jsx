import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  ArrowLeft,
  Users,
  ChevronDown,
  Sparkles,
  X,
  Ruler,
  Compass,
  Award,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Zap,
} from 'lucide-react';
import api from '../api/axiosConfig';

const STATUS_PILL = {
  submitted: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  shortlisted:
    'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30 shadow-[0_0_12px_rgba(212,175,55,0.15)]',
  accepted:
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const MATCH_STYLE = (score) =>
  score >= 70
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : score >= 40
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

export default function ManageApplicants() {
  const { id } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [casting, setCasting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inspectingApp, setInspectingApp] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        const [castRes, appRes] = await Promise.all([
          api.get(`/castings/${id}`),
          api.get(`/castings/${id}/applicants`),
        ]);
        if (!ignore) {
          setCasting(castRes.data.data);
          setApplicants(appRes.data.data);
        }
      } catch (err) {
        if (!ignore) console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchData();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setError(null);
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
      setApplicants(
        applicants.map((app) => (app._id === applicationId ? { ...app, status: newStatus } : app)),
      );
      if (inspectingApp && inspectingApp._id === applicationId) {
        setInspectingApp((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-white/5 rounded-lg" />
          <div className="h-4 w-40 bg-white/5 rounded" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/[0.03] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/castings/${id}`}
          className="text-[#d4af37] hover:text-[#f5e7ba] text-xs font-mono uppercase tracking-wider mb-3 inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Return to Casting Call
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
              <Users size={22} className="text-[#d4af37]" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white">Production Applicants</h1>
              {casting && (
                <p className="text-xs font-mono text-zinc-400 mt-0.5">
                  Scouting roster for "{casting.title}"
                </p>
              )}
            </div>
          </div>
          <span className="self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
            {applicants.length} Submissions Logged
          </span>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3"
        >
          {error}
        </motion.p>
      )}

      {/* Applicant Cards List */}
      <div className="space-y-3">
        <AnimatePresence>
          {applicants.map((app, i) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 10) * 0.04 }}
              className="glass-dark rounded-2xl border border-white/10 p-5 hover:border-[#d4af37]/40 transition-all duration-300 shadow-lg group"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Candidate Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <Link
                      to={`/p/${app.modelProfileId?._id}`}
                      className="font-display font-bold text-lg text-white group-hover:text-[#d4af37] transition-colors"
                    >
                      {app.modelProfileId?.fullName || 'Anonymous Talent'}
                    </Link>
                    {app.modelProfileId?.isVerified && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 font-mono">
                    <span>{app.modelProfileId?.country || 'International'}</span>
                    <span className="text-zinc-700">•</span>
                    <span>{app.modelProfileId?.heightCm || '-'} cm</span>
                    <span className="text-zinc-700">•</span>
                    <span className="capitalize text-[#d4af37]/80">
                      {app.modelProfileId?.category || 'Model'}
                    </span>
                    <span className="text-zinc-700">•</span>
                    <span>
                      Applied{' '}
                      {new Date(app.appliedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Compatibility Interactive Badge */}
                <div className="flex items-center gap-3">
                  {typeof app.matchScore === 'number' && (
                    <button
                      type="button"
                      onClick={() => setInspectingApp(app)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 ${MATCH_STYLE(app.matchScore)}`}
                      title="Click to view compatibility score breakdown"
                    >
                      <Sparkles size={13} />
                      <span>{app.matchScore}% Match</span>
                    </button>
                  )}

                  {/* Status Dropdown */}
                  <div className="relative">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className={`appearance-none pl-4 pr-9 py-2 rounded-xl text-xs font-mono uppercase tracking-wider border cursor-pointer bg-zinc-950/80 transition-all font-semibold ${STATUS_PILL[app.status] || 'bg-white/5 text-zinc-400 border-white/10'}`}
                    >
                      <option value="submitted" className="bg-zinc-900 text-white">
                        Submitted
                      </option>
                      <option value="shortlisted" className="bg-zinc-900 text-[#d4af37]">
                        Shortlisted
                      </option>
                      <option value="accepted" className="bg-zinc-900 text-emerald-400">
                        Accepted
                      </option>
                      <option value="rejected" className="bg-zinc-900 text-rose-400">
                        Rejected
                      </option>
                    </select>
                    <ChevronDown
                      size={13}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"
                    />
                  </div>

                  {/* Direct Chat Unlock */}
                  {app.status === 'accepted' && (
                    <Link
                      to={`/chat/${app._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#d4af37]/25 transition-all shadow-md"
                    >
                      <MessageCircle size={13} /> Direct Line
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {applicants.length === 0 && (
          <div className="flex flex-col items-center py-20 text-zinc-500 glass-dark rounded-2xl border border-white/5 p-8 text-center">
            <Users size={40} className="mb-3 text-zinc-600" aria-hidden="true" />
            <h3 className="text-white font-medium text-lg mb-1">No Applications Yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Talent submissions will automatically surface here with compatibility scores as
              candidates submit their comp cards.
            </p>
          </div>
        )}
      </div>

      {/* Interactive Compatibility Score Inspector Modal */}
      <AnimatePresence>
        {inspectingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.25 }}
              className="glass-dark rounded-3xl border border-[#d4af37]/40 max-w-2xl w-full p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
            >
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-start justify-between pb-6 border-b border-white/10 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 text-xs font-mono uppercase tracking-wider mb-2">
                    <Sparkles size={12} /> Explainable Multi-Dimensional Match
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white">
                    {inspectingApp.modelProfileId?.fullName}
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Evaluated against:{' '}
                    <strong className="text-white font-sans">{casting?.title}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setInspectingApp(null)}
                  aria-label="Close applicant details"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body: Radial Gauge & Explainability Summary */}
              <div className="py-6 space-y-6 relative z-10">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  {/* Radial Gauge */}
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="#27272a"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="#d4af37"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={289}
                        initial={{ strokeDashoffset: 289 }}
                        animate={{
                          strokeDashoffset: 289 - (289 * (inspectingApp.matchScore || 0)) / 100,
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-display font-bold text-white">
                        {inspectingApp.matchScore}%
                      </span>
                      <span className="text-[9px] font-mono text-[#d4af37] uppercase">
                        {inspectingApp.matchTier || 'MATCH'}
                      </span>
                    </div>
                  </div>

                  {/* Summary text */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                      <span className="text-xs font-mono uppercase text-[#d4af37] font-semibold">
                        Algorithmic Analysis Summary
                      </span>
                      {inspectingApp.matchTier && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-bold uppercase">
                          Tier: {inspectingApp.matchTier}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-200 leading-relaxed">
                      {inspectingApp.matchExplanation ||
                        (inspectingApp.matchScore >= 75
                          ? `Exceptional fit for "${casting?.title}". Physical attributes and category requirements meet or exceed criteria.`
                          : inspectingApp.matchScore >= 50
                            ? `Strong compatibility candidate. Category alignment is favorable with minor variances in secondary criteria.`
                            : `Moderate fit. Requires review on specific casting parameters or specialized criteria requirements.`)}
                    </p>
                  </div>
                </div>

                {/* Dimensional Factor Progress Breakdown */}
                {(() => {
                  const b = inspectingApp.matchBreakdown || {};

                  // Height specs
                  const targetMinHt = casting?.criteria?.minHeightCm;
                  const targetMaxHt = casting?.criteria?.maxHeightCm;
                  const heightSpecText = targetMinHt || targetMaxHt
                    ? `${targetMinHt || 'Any'}–${targetMaxHt || 'Any'}cm`
                    : 'Open';
                  const heightMatched = b.height ? b.height.matched : true;
                  const heightSpecified = b.height?.specified ?? Boolean(targetMinHt || targetMaxHt);

                  // Age specs
                  const targetMinAge = casting?.criteria?.minAge;
                  const targetMaxAge = casting?.criteria?.maxAge;
                  const ageSpecText = targetMinAge || targetMaxAge
                    ? `${targetMinAge || 'Any'}–${targetMaxAge || 'Any'} yrs`
                    : 'Open';
                  const ageMatched = b.age ? b.age.matched : true;
                  const ageSpecified = b.age?.specified ?? Boolean(targetMinAge || targetMaxAge);
                  const candidateAge = b.age?.value;

                  // Category
                  const catMatched = b.category?.matched ?? (inspectingApp.modelProfileId?.category === casting?.category);
                  const catAffinity = b.category?.affinityScore ?? (catMatched ? 1 : 0);

                  // Country
                  const countryMatched = b.country?.matched ?? (inspectingApp.modelProfileId?.country === casting?.country);

                  // Skills
                  const reqSkills = b.skills?.requiredSkills || casting?.criteria?.requiredSkills || [];
                  const matchedSkills = b.skills?.matchedSkills || [];

                  return (
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                        Criteria Factor Breakdown
                      </h4>

                      {/* Height Factor */}
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Ruler size={16} className="text-[#d4af37]" />
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              Height Range Alignment
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              Candidate: {inspectingApp.modelProfileId?.heightCm || 'N/A'}cm | Target: {heightSpecText}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                            !heightSpecified
                              ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              : heightMatched
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {!heightSpecified ? 'Open Range' : heightMatched ? 'Satisfied' : 'Outside Range'}
                        </span>
                      </div>

                      {/* Age Factor */}
                      {ageSpecified && (
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-[#d4af37]" />
                            <div>
                              <span className="text-xs font-semibold text-white block">
                                Age Range Alignment
                              </span>
                              <span className="text-[11px] text-zinc-400 font-mono">
                                Candidate: {candidateAge ? `${candidateAge} yrs` : 'Recorded'} | Target: {ageSpecText}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                              ageMatched
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {ageMatched ? 'Satisfied' : 'Outside Range'}
                          </span>
                        </div>
                      )}

                      {/* Category Factor */}
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Award size={16} className="text-[#d4af37]" />
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              Category Affinity
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono capitalize">
                              Model: {inspectingApp.modelProfileId?.category || 'General'} | Casting: {casting?.category}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-mono px-2.5 py-0.5 rounded-full border capitalize ${
                            catMatched
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : catAffinity > 0
                                ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {catMatched
                            ? 'Direct Match'
                            : catAffinity > 0
                              ? `Affinity (${Math.round(catAffinity * 100)}%)`
                              : 'Different Discipline'}
                        </span>
                      </div>

                      {/* Location Proximity */}
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Compass size={16} className="text-[#d4af37]" />
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              Territory & Mobility
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              Based in: {inspectingApp.modelProfileId?.country || 'International'} | Production in:{' '}
                              {casting?.country || 'Any'}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                            countryMatched
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                          }`}
                        >
                          {countryMatched ? 'Local Resident' : 'Regional / Travel'}
                        </span>
                      </div>

                      {/* Skills Factor */}
                      {reqSkills.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Zap size={16} className="text-[#d4af37]" />
                            <div>
                              <span className="text-xs font-semibold text-white block">
                                Required Skills Intersection
                              </span>
                              <span className="text-[11px] text-zinc-400 font-mono">
                                Required: {reqSkills.join(', ')}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                              matchedSkills.length === reqSkills.length
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : matchedSkills.length > 0
                                  ? 'bg-amber-400/10 text-amber-300 border-amber-400/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {matchedSkills.length}/{reqSkills.length} Matched
                          </span>
                        </div>
                      )}

                      {/* Key Strengths & Gaps */}
                      {((inspectingApp.matchStrengths && inspectingApp.matchStrengths.length > 0) ||
                        (inspectingApp.matchGaps && inspectingApp.matchGaps.length > 0)) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {inspectingApp.matchStrengths && inspectingApp.matchStrengths.length > 0 && (
                            <div className="p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1.5 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Key Strengths
                              </span>
                              <ul className="space-y-1">
                                {inspectingApp.matchStrengths.map((str, idx) => (
                                  <li
                                    key={idx}
                                    className="text-[11px] text-zinc-300 font-sans flex items-start gap-1.5"
                                  >
                                    <span className="text-emerald-400 mt-0.5">•</span>
                                    <span>{str}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {inspectingApp.matchGaps && inspectingApp.matchGaps.length > 0 && (
                            <div className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/20">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold mb-1.5 flex items-center gap-1">
                                <AlertCircle size={12} /> Variance / Gaps
                              </span>
                              <ul className="space-y-1">
                                {inspectingApp.matchGaps.map((gap, idx) => (
                                  <li
                                    key={idx}
                                    className="text-[11px] text-zinc-300 font-sans flex items-start gap-1.5"
                                  >
                                    <span className="text-amber-400 mt-0.5">•</span>
                                    <span>{gap}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4 relative z-10">
                <Link
                  to={`/p/${inspectingApp.modelProfileId?._id}`}
                  className="text-xs text-[#d4af37] hover:underline font-mono"
                >
                  View Full Comp Card & Portfolio →
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(inspectingApp._id, 'shortlisted')}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#d4af37]/25 transition-all cursor-pointer"
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(inspectingApp._id, 'accepted')}
                    className="btn-gold px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    Accept Candidate
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
