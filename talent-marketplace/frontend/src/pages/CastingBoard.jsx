import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Inbox, Plus, ArrowRight, Clock } from 'lucide-react';
import api from '../api/axiosConfig';
import useAuthStore from '../store/authStore';

// Curated high-fashion casting fallbacks with moodboard imagery
const curatedCastingFallbacks = [
  {
    _id: 'c1',
    title: 'Milan Autumn Fashion Week — Runway Opening Lead',
    description:
      'Seeking high-fashion runway models for the opening segment of Milan Fashion Week. Prior runway walk experience and ability to attend 2 fitting sessions in Milan required.',
    category: 'runway',
    country: 'Italy',
    status: 'open',
    applicationDeadline: '2026-10-25T00:00:00.000Z',
    ageRange: { min: 18, max: 28 },
    heightRangeCm: { min: 178, max: 188 },
    moodboardUrl:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    compensation: '€2,500 / Day + Flights',
  },
  {
    _id: 'c2',
    title: 'Vogue Global Haute Couture Editorial Campaign',
    description:
      'High-concept print and digital editorial spread shot across Paris historic landmarks. Looking for models with strong expressive facial structure and versatile posing capabilities.',
    category: 'editorial',
    country: 'France',
    status: 'open',
    applicationDeadline: '2026-11-04T00:00:00.000Z',
    ageRange: { min: 19, max: 32 },
    heightRangeCm: { min: 175, max: 185 },
    moodboardUrl:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    compensation: '€4,200 Total Fee',
  },
  {
    _id: 'c3',
    title: 'Colombo Fashion Week 2026 Resort Wear Showcase',
    description:
      'Official opening show casting for South Asian premier resort wear designers. Looking for diverse models with confident catwalk presence.',
    category: 'runway',
    country: 'Sri Lanka',
    status: 'open',
    applicationDeadline: '2026-11-15T00:00:00.000Z',
    ageRange: { min: 18, max: 30 },
    heightRangeCm: { min: 174, max: 190 },
    moodboardUrl:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop',
    compensation: 'LKR 150,000 / Show',
  },
  {
    _id: 'c4',
    title: 'Miss Global Pageant 2026 National Auditions',
    description:
      'Official delegate search for the upcoming international pageant. Seeking articulate, poised candidates with leadership and public presentation background.',
    category: 'pageant',
    country: 'International',
    status: 'open',
    applicationDeadline: '2026-12-01T00:00:00.000Z',
    ageRange: { min: 18, max: 28 },
    heightRangeCm: { min: 172, max: 185 },
    moodboardUrl:
      'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800&auto=format&fit=crop',
    compensation: 'Franchise Crown Sponsorship',
  },
  {
    _id: 'c5',
    title: 'High-End Luxury Watch & Jewelry Commercial Campaign',
    description:
      'Major advertising campaign for Swiss watch manufacturer. Studio shoot in Geneva followed by location video reel in Tokyo.',
    category: 'commercial',
    country: 'Switzerland',
    status: 'open',
    applicationDeadline: '2026-11-20T00:00:00.000Z',
    ageRange: { min: 22, max: 40 },
    heightRangeCm: { min: 175, max: 192 },
    moodboardUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
    compensation: '$5,500 Full Rights',
  },
  {
    _id: 'c6',
    title: 'Tokyo Streetwear Lookbook & Runway Collective',
    description:
      'Avant-garde streetwear collection lookbook and private salon runway in Shibuya. Looking for edgy editorial models with distinct styling.',
    category: 'editorial',
    country: 'Japan',
    status: 'open',
    applicationDeadline: '2026-11-10T00:00:00.000Z',
    ageRange: { min: 18, max: 30 },
    heightRangeCm: { min: 170, max: 188 },
    moodboardUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
    compensation: '¥300,000 Total',
  },
];

const categoryBadges = {
  runway: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  editorial: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  commercial: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  pageant: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

export default function CastingBoard() {
  const { user } = useAuthStore();
  const [castings, setCastings] = useState(curatedCastingFallbacks);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCastings = async () => {
      try {
        const res = await api.get('/castings');
        if (res.data.data && res.data.data.length > 0) {
          // Merge real castings with curated visuals
          setCastings(res.data.data);
        }
      } catch {
        // Keep fallbacks
      } finally {
        setLoading(false);
      }
    };
    fetchCastings();
  }, []);

  const categories = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'runway', label: 'Runway' },
    { id: 'editorial', label: 'Editorial' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'pageant', label: 'Pageants' },
  ];

  const filteredCastings =
    selectedCategory === 'all'
      ? castings
      : castings.filter((c) => c.category?.toLowerCase() === selectedCategory);

  const canPostCasting =
    user?.role === 'industry_professional' ||
    user?.role === 'pageant_organizer' ||
    user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-8 border-b border-white/10">
          <div>
            <span className="text-xs font-mono tracking-[0.25em] uppercase text-amber-400 mb-2 block">
              International Casting Call Board
            </span>
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white">
              Casting{' '}
              <span className="italic font-serif font-normal gold-gradient-text">
                Opportunities
              </span>
            </h1>
            <p className="mt-2 text-zinc-400 text-sm max-w-xl font-light">
              Explore open roles from accredited casting agencies, fashion production houses, and
              international pageant franchises.
            </p>
          </div>

          {canPostCasting && (
            <Link
              to="/castings/create"
              className="btn-gold !text-xs !py-3 !px-5 mt-6 md:mt-0 flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Post New Casting Call</span>
            </Link>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-400/20'
                  : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:border-white/20'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Casting Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCastings.map((c, idx) => {
            const badgeCls =
              categoryBadges[c.category?.toLowerCase()] ||
              'bg-zinc-800 text-zinc-300 border-zinc-700';
            const moodboard =
              c.moodboardUrl ||
              curatedCastingFallbacks[idx % curatedCastingFallbacks.length].moodboardUrl;

            return (
              <motion.div
                key={c._id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                whileHover={{ y: -6 }}
                className="group rounded-2xl overflow-hidden glass-dark border border-white/10 hover:border-amber-400/40 shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Moodboard Header Image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950">
                    <img
                      src={moodboard}
                      alt={c.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center filter brightness-90 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <span
                        className={`text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full border backdrop-blur-md font-semibold ${badgeCls}`}
                      >
                        {c.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                        {c.status || 'OPEN'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
                      <MapPin size={12} className="text-amber-400" />
                      <span>{c.country}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h2 className="text-lg font-bold font-display text-white group-hover:text-amber-300 transition-colors leading-snug mb-3">
                      {c.title}
                    </h2>
                    <p className="text-xs text-zinc-400 line-clamp-3 font-sans leading-relaxed mb-6">
                      {c.description}
                    </p>

                    {/* Physical Requirements Specs Pills */}
                    {(c.heightRangeCm || c.ageRange) && (
                      <div className="flex flex-wrap gap-2 mb-4 font-mono text-[11px] text-zinc-300">
                        {c.heightRangeCm?.min && (
                          <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
                            Ht: {c.heightRangeCm.min}–{c.heightRangeCm.max || 'Any'} cm
                          </span>
                        )}
                        {c.ageRange?.min && (
                          <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
                            Age: {c.ageRange.min}–{c.ageRange.max || 'Any'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 border-t border-white/5 flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-xs font-mono text-amber-400 font-semibold">
                    <Clock size={13} />
                    <span>Deadline: {new Date(c.applicationDeadline).toLocaleDateString()}</span>
                  </div>

                  <Link
                    to={`/castings/${c._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white hover:text-amber-300 font-bold transition-colors"
                  >
                    <span>View Brief</span>
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {!loading && filteredCastings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 glass-dark rounded-3xl border border-white/10 text-center px-4">
            <Inbox size={48} className="text-amber-400/40 mb-4" />
            <h3 className="text-lg font-bold font-sans text-white mb-2">
              No Open Castings in this Category
            </h3>
            <p className="text-zinc-400 text-xs max-w-sm mb-6">
              Check back soon or explore other categories on the board.
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="btn-ghost-luxury !text-xs !py-2"
            >
              Show All Castings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
