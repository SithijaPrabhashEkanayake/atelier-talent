import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Folder,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axiosConfig';
import soundFX from '../utils/soundEffects';
import fireGoldConfetti from '../utils/confetti';

export default function CastingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [casting, setCasting] = useState(null);
  const [ownProfileId, setOwnProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [closeError, setCloseError] = useState('');

  useEffect(() => {
    let ignore = false;
    setCasting(null);
    setLoading(true);
    const fetchCasting = async () => {
      try {
        const res = await api.get(`/castings/${id}`);
        if (!ignore) setCasting(res.data.data);
      } catch (err) {
        if (!ignore) console.error('Failed to load casting', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchCasting();
    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    if (user?.role !== 'industry_professional' && user?.role !== 'pageant_organizer') return;
    api
      .get('/profiles/me')
      .then((res) => setOwnProfileId(res.data.data?._id))
      .catch(() => setOwnProfileId(null));
  }, [user?.role]);

  const handleApply = async () => {
    setApplying(true);
    setMessage('');
    try {
      await api.post('/applications', { castingCallId: casting._id });
      soundFX.playCelebration();
      fireGoldConfetti({ particleCount: 80 });
      setMessage('Application submitted successfully to casting director!');
    } catch (err) {
      soundFX.playTick();
      setMessage(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  const handleClose = async () => {
    if (
      !window.confirm(
        'Close this casting call? Models will no longer be able to apply, and this action cannot be undone.',
      )
    )
      return;
    setCloseError('');
    try {
      await api.patch(`/castings/${id}/close`);
      setCasting({ ...casting, status: 'closed' });
    } catch (err) {
      console.error(err);
      setCloseError(err.response?.data?.message || 'Failed to close casting call.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-amber-400 font-mono text-xs uppercase tracking-widest animate-pulse">
        Retrieving Production Brief…
      </div>
    );
  }

  if (!casting) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle size={48} className="text-amber-400 mb-4" />
        <h2 className="text-2xl font-display font-bold text-white mb-2">
          Casting Notice Not Found
        </h2>
        <p className="text-zinc-400 text-xs max-w-sm mb-6">
          This production notice may have expired, been removed by moderators, or does not exist.
        </p>
        <Link to="/castings" className="btn-ghost-luxury text-xs !py-2">
          Return to Casting Board
        </Link>
      </div>
    );
  }

  const isCreator = !!ownProfileId && ownProfileId === casting.creatorProfileId;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Navigation */}
      <Link
        to="/castings"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-amber-400 transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        <span>Back to Casting Board</span>
      </Link>

      {/* Main Casting Detail Container */}
      <div className="glass-dark rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-8 border-b border-white/10">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                {casting.category || 'Production'}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full border ${
                  casting.status === 'open'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}
              >
                {casting.status === 'open' ? <CheckCircle2 size={11} /> : <Lock size={11} />}
                <span>{casting.status.toUpperCase()}</span>
              </span>
              {casting.applicationDeadline && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  <Clock size={12} className="text-amber-400" />
                  Deadline: {new Date(casting.applicationDeadline).toLocaleDateString()}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-tight">
              {casting.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 mt-4">
              <span className="inline-flex items-center gap-1.5 text-zinc-300">
                <MapPin size={13} className="text-amber-400" />
                <span>{casting.country}</span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="inline-flex items-center gap-1.5 text-zinc-300">
                <Folder size={13} className="text-amber-400" />
                <span className="capitalize">{casting.category}</span>
              </span>
            </div>
          </div>

          {/* Organizer Control Panel */}
          {isCreator && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/castings/${id}/applicants`)}
                className="btn-gold !text-xs !py-2.5 !px-4"
              >
                <Users size={14} className="mr-1.5" />
                <span>Manage Applicants</span>
              </button>
              {casting.status === 'open' && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-ghost-luxury !text-xs !py-2.5 !px-4 border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                >
                  <span>Close Call</span>
                </button>
              )}
            </div>
          )}
        </div>

        {closeError && (
          <div
            role="alert"
            className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
          >
            <AlertTriangle size={15} />
            <span>{closeError}</span>
          </div>
        )}

        {/* Narrative Description */}
        <div className="py-8 border-b border-white/10">
          <h2 className="text-lg font-display font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <span>Production Brief & Creative Scope</span>
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-sans font-light">
            {casting.description}
          </p>
        </div>

        {/* Requirement & Criteria Breakdown */}
        <div className="py-8 border-b border-white/10">
          <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-400" />
            <span>Casting Suitability & Measurement Criteria</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                Age Window
              </span>
              <span className="text-sm font-mono font-semibold text-white">
                {casting.criteria?.minAge || casting.criteria?.maxAge
                  ? `${casting.criteria.minAge || 18} – ${casting.criteria.maxAge || 35} yrs`
                  : 'Open'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                Height Range
              </span>
              <span className="text-sm font-mono font-semibold text-white">
                {casting.criteria?.minHeightCm || casting.criteria?.maxHeightCm
                  ? `${casting.criteria.minHeightCm || 170} – ${casting.criteria.maxHeightCm || 195} cm`
                  : 'Open'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                Experience Level
              </span>
              <span className="text-sm font-mono font-semibold text-white capitalize">
                {casting.criteria?.experienceLevel || 'Any'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                Audition Territory
              </span>
              <span className="text-sm font-mono font-semibold text-white">
                {casting.country || 'International'}
              </span>
            </div>
          </div>
        </div>

        {/* Model Application Call to Action */}
        {user?.role === 'model' && casting.status === 'open' && (
          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-display font-semibold text-white">
                Ready for Consideration?
              </h3>
              <p className="text-xs text-zinc-400 font-light mt-0.5">
                Your verified composite card and multimedia portfolio will be submitted to the
                production team.
              </p>
            </div>

            <div className="w-full sm:w-auto">
              {message && (
                <div
                  role="status"
                  className={`mb-3 p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                    message.includes('success')
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {message.includes('success') ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                  <span>{message}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleApply}
                disabled={applying}
                className="btn-gold w-full sm:w-auto !py-3 !px-8 cursor-pointer"
              >
                <span>{applying ? 'Transmitting Comp-Card…' : 'Submit Application'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
