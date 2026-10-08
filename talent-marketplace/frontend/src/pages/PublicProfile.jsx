import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  MapPin,
  Sparkles,
  ArrowLeft,
  Film,
  Camera,
  Scale,
  Printer,
  Check,
} from 'lucide-react';
import api from '../api/axiosConfig';
import MediaLightbox from '../components/MediaLightbox';
import useCompareStore from '../store/compareStore';
import soundFX from '../utils/soundEffects';
import { SL_FEMALE_PHOTOS } from '../data/sriLankanTalent';

function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="h-64 rounded-3xl bg-zinc-900/80 mb-20 relative border border-white/5">
        <div className="absolute -bottom-12 left-8 w-32 h-32 rounded-3xl bg-zinc-800 border-4 border-[#09090b]" />
      </div>
      <div className="h-8 w-64 bg-zinc-800 rounded-xl mb-3" />
      <div className="h-4 w-40 bg-zinc-800 rounded-lg mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-2xl bg-zinc-900 border border-white/5" />
        ))}
      </div>
    </div>
  );
}

export default function PublicProfile() {
  const { profileId } = useParams();
  const { selectedTalents, addTalent } = useCompareStore();
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, portfolioRes] = await Promise.all([
          api.get(`/profiles/${profileId}`),
          api.get(`/portfolio/${profileId}`),
        ]);
        setProfile(profileRes.data.data);
        setPortfolio(portfolioRes.data.data || []);
      } catch {
        setError('Talent profile not found or clearance is restricted.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profileId]);

  if (loading) return <ProfileSkeleton />;
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-display font-bold text-white mb-2">Profile Unavailable</h2>
        <p className="text-zinc-400 text-xs max-w-sm mb-6">{error}</p>
        <Link to="/search" className="btn-ghost-luxury text-xs !py-2">
          Return to Talent Directory
        </Link>
      </div>
    );
  }

  const coverImage = portfolio[0]?.mediaUrl || SL_FEMALE_PHOTOS[4];
  const displayName = profile.fullName || profile.organizationName || 'Talent Profile';

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxItems = portfolio.map((item, idx) => ({
    url: item.mediaUrl,
    title: `${displayName} ${item.category?.toUpperCase() || 'EDITORIAL'}`,
    caption: `Asset #${idx + 1} • Format: ${item.type?.toUpperCase()} • Category: ${item.category}`,
  }));

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-amber-400 transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          <span>Talent Directory</span>
        </Link>

        {/* Editorial Cover Banner */}
        <div className="theme-invariant relative mb-20">
          <div className="h-64 sm:h-80 rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl">
            <img
              src={coverImage}
              alt="Editorial Cover"
              className="w-full h-full object-cover object-center filter brightness-50 contrast-110 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
            <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent" />
          </div>

          {/* Avatar Hero Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute -bottom-14 left-8 sm:left-12 w-32 h-32 sm:w-36 sm:h-36 rounded-3xl border-4 border-[#09090b] shadow-2xl overflow-hidden bg-zinc-900"
          >
            <img
              src={coverImage}
              alt={displayName}
              className="w-full h-full object-cover object-top"
            />
          </motion.div>
        </div>

        {/* Profile Bio & Stats Overview */}
        <div className="pl-4 sm:pl-52 -mt-10 mb-12 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight">
                {displayName}
              </h1>
              {profile.isVerified && (
                <div className="flex items-center gap-1 bg-amber-400 text-zinc-950 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-lg">
                  <BadgeCheck size={13} />
                  <span>VERIFIED</span>
                </div>
              )}
            </div>

            <p className="text-sm font-mono text-zinc-400 mt-2 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-zinc-300">
                <MapPin size={13} className="text-amber-400" /> {profile.country || 'International'}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="capitalize text-amber-300">
                {profile.category || profile.organizationType || 'Model'}
              </span>
              {Array.isArray(profile.experience) && profile.experience.length > 0 && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400 capitalize">
                    {profile.experience.length} credit{profile.experience.length !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {profile.category && (
              <button
                type="button"
                onClick={() => addTalent({ ...profile, id: profile._id || profileId })}
                className={`px-4 py-2.5 rounded-full border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedTalents.some((t) => (t.id || t._id) === (profile._id || profileId))
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold shadow-lg'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {selectedTalents.some((t) => (t.id || t._id) === (profile._id || profileId)) ? (
                  <>
                    <Check size={13} />
                    <span>In Compare Tray</span>
                  </>
                ) : (
                  <>
                    <Scale size={13} />
                    <span>+ Compare</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundFX.playTick();
                window.print();
              }}
              className="btn-ghost-luxury !text-xs !py-2.5 !px-4 flex items-center gap-1.5 cursor-pointer"
              title="Print or export high-resolution editorial composite card"
            >
              <Printer size={14} />
              <span>Export Comp-Card</span>
            </button>

            <Link to="/castings" className="btn-gold !text-xs !py-2.5 !px-5">
              <span>Invite to Casting</span>
            </Link>
          </div>
        </div>

        {/* Standardized Composite Card Measurements */}
        {(profile.heightCm || profile.measurements) && (
          <div className="glass-dark rounded-3xl p-6 sm:p-8 border border-white/10 mb-12 shadow-2xl">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-amber-400 mb-6 flex items-center gap-2">
              <Sparkles size={14} /> Standardized Editorial Specifications
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {profile.heightCm && (
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5">
                  <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    Height
                  </span>
                  <span className="text-base font-mono font-bold text-white">
                    {profile.heightCm} cm
                  </span>
                </div>
              )}
              {profile.measurements?.bust && (
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5">
                  <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    Bust / Chest
                  </span>
                  <span className="text-base font-mono font-bold text-white">
                    {profile.measurements.bust} cm
                  </span>
                </div>
              )}
              {profile.measurements?.waist && (
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5">
                  <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    Waist
                  </span>
                  <span className="text-base font-mono font-bold text-white">
                    {profile.measurements.waist} cm
                  </span>
                </div>
              )}
              {profile.measurements?.hips && (
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5">
                  <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    Hips
                  </span>
                  <span className="text-base font-mono font-bold text-white">
                    {profile.measurements.hips} cm
                  </span>
                </div>
              )}
              {profile.eyeColor && (
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5">
                  <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    Eye Color
                  </span>
                  <span className="text-base font-mono font-bold text-white">
                    {profile.eyeColor}
                  </span>
                </div>
              )}
              {profile.hairColor && (
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5">
                  <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    Hair Shade
                  </span>
                  <span className="text-base font-mono font-bold text-white">
                    {profile.hairColor}
                  </span>
                </div>
              )}
            </div>

            {profile.bio && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-zinc-300 text-sm leading-relaxed font-light">{profile.bio}</p>
              </div>
            )}
          </div>
        )}

        {/* Multimedia Portfolio Gallery */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-mono tracking-[0.25em] uppercase text-amber-400 mb-1 block">
                Visual Archives
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Editorial & Runway Portfolio
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {portfolio.length} {portfolio.length === 1 ? 'Asset' : 'Assets'}
            </span>
          </div>

          {portfolio.length === 0 ? (
            <div className="glass-dark rounded-3xl p-16 text-center border border-white/5">
              <Camera size={32} className="text-amber-400/50 mx-auto mb-3" />
              <p className="text-zinc-400 text-xs font-light">
                No portfolio materials published to this profile yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {portfolio.map((item, idx) => (
                <motion.div
                  key={item._id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-amber-400/50 shadow-xl cursor-pointer transition-all duration-300"
                  onClick={() => openLightbox(idx)}
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-900">
                    {item.type === 'photo' ? (
                      <img
                        src={item.mediaUrl}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={item.mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Film size={24} className="text-amber-400" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                      {item.category || 'Editorial'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={lightboxItems}
        currentIndex={lightboxIndex}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />
    </div>
  );
}
