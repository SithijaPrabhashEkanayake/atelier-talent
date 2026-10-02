import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Calendar, Inbox, Sparkles, ArrowRight } from 'lucide-react';
import api from '../api/axiosConfig';

const CATEGORY_ACCENT = {
  runway: 'from-[#d4af37] via-amber-500 to-[#d4af37]/60',
  editorial: 'from-purple-500 via-pink-500 to-[#d4af37]',
  commercial: 'from-sky-500 via-teal-400 to-emerald-500',
  pageant: 'from-[#d4af37] via-[#f5e7ba] to-amber-600',
};

const STATUS_STYLE = {
  submitted: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  shortlisted:
    'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30 shadow-[0_0_12px_rgba(212,175,55,0.15)]',
  accepted:
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

function CardSkeleton() {
  return (
    <div className="glass-dark rounded-2xl border border-white/5 overflow-hidden animate-pulse">
      <div className="h-1.5 bg-white/5" />
      <div className="p-6 space-y-3">
        <div className="h-5 w-2/3 bg-white/10 rounded" />
        <div className="h-3 w-1/3 bg-white/5 rounded" />
        <div className="h-6 w-24 bg-white/5 rounded-full mt-4" />
      </div>
    </div>
  );
}

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get('/applications/me');
        setApplications(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#d4af37] font-semibold flex items-center gap-2">
          <Sparkles size={13} className="text-[#d4af37]" />
          Casting Pipeline
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mt-1">
          My Applications
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Track the status of your submitted casting submissions and responses.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-20 text-center glass-dark rounded-2xl border border-white/10 p-8"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mb-4">
            <Inbox size={28} aria-hidden="true" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">No Active Submissions</h3>
          <p className="text-zinc-400 text-sm max-w-sm mb-6">
            You haven't submitted your comp card to any casting calls yet. Discover curated
            opportunities on the casting board.
          </p>
          <Link
            to="/castings"
            className="btn-gold inline-flex items-center gap-2 text-sm px-6 py-2.5 rounded-full font-medium"
          >
            Explore Castings <ArrowRight size={15} />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app, i) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 8) * 0.05 }}
              whileHover={{ y: -4 }}
              className="glass-dark rounded-2xl border border-white/10 hover:border-[#d4af37]/40 transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div
                  className={`h-1.5 bg-gradient-to-r ${CATEGORY_ACCENT[app.castingCallId?.category] || 'from-[#d4af37] to-amber-600'}`}
                />
                <div className="p-6">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#d4af37]/80 capitalize">
                    {app.castingCallId?.category || 'General'}
                  </span>
                  <h3 className="font-display font-semibold text-lg text-white group-hover:text-[#d4af37] transition-colors mt-1 line-clamp-1">
                    <Link to={`/castings/${app.castingCallId?._id}`}>
                      {app.castingCallId?.title || 'Casting Call'}
                    </Link>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 inline-flex items-center gap-1.5">
                    <Calendar size={12} className="text-zinc-500" aria-hidden="true" />
                    Applied{' '}
                    {new Date(app.appliedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-white/5">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider border ${STATUS_STYLE[app.status] || 'bg-white/5 text-zinc-400 border-white/10'}`}
                >
                  {app.status}
                </span>

                {app.status === 'accepted' && (
                  <Link
                    to={`/chat/${app._id}`}
                    className="text-xs text-[#d4af37] hover:text-[#f5e7ba] font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 hover:bg-[#d4af37]/20 transition-all"
                  >
                    <MessageCircle size={13} aria-hidden="true" /> Direct Chat
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
