import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Sliders,
  Globe2,
  Award,
  Users2,
  Flame,
  Clock,
} from 'lucide-react';
import api from '../api/axiosConfig';
import VideoHero from '../components/VideoHero';
import BrandMarquee from '../components/BrandMarquee';
import CompCard from '../components/CompCard';
import Carousel from '../components/Carousel';
import ParallaxBanner from '../components/ParallaxBanner';
import MediaLightbox from '../components/MediaLightbox';
import AnimatedCounter from '../components/AnimatedCounter';
import { SL_FALLBACK_TALENT } from '../data/sriLankanTalent';

const editorialFallbacks = SL_FALLBACK_TALENT;

function MetricsStrip() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get('/stats')
      .then((res) => setStats(res.data.data))
      .catch(() => setStats(null));
  }, []);

  const metrics = [
    {
      label: 'Published Talent',
      value: stats?.publishedTalent,
      icon: Users2,
      sub: 'Models & talent profiles',
    },
    {
      label: 'Verified Talent',
      value: stats?.verifiedTalent,
      icon: Award,
      sub: 'Profiles approved by an admin',
    },
    {
      label: 'Open Casting Calls',
      value: stats?.openCastings,
      icon: Flame,
      sub: 'Accepting applications now',
    },
    {
      label: 'Applications Received',
      value: stats?.submissions,
      icon: Globe2,
      sub: 'Submissions to date',
    },
  ];

  return (
    <section className="py-14 bg-zinc-950/80 border-y border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Icon size={22} />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                    {typeof m.value === 'number' ? <AnimatedCounter end={m.value} /> : '—'}
                  </div>
                  <div className="text-xs font-mono text-zinc-300 font-medium">{m.label}</div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{m.sub}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ModelShowcaseSection({ onOpenLightbox }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'grid'
  const [talent, setTalent] = useState(editorialFallbacks);

  useEffect(() => {
    api
      .get('/profiles/showcase')
      .then((res) => {
        if (res.data.data && res.data.data.length > 0) {
          setTalent(res.data.data);
        }
      })
      .catch(() => {
        // High-fashion fallbacks remain in place
      });
  }, []);

  const categories = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'runway', label: 'Runway & Couture' },
    { id: 'editorial', label: 'High Fashion Editorial' },
    { id: 'commercial', label: 'Commercial Campaigns' },
    { id: 'pageant', label: 'Pageant Delegates' },
  ];

  const filteredTalent =
    selectedCategory === 'all'
      ? talent
      : talent.filter((t) => t.category?.toLowerCase() === selectedCategory);

  return (
    <section className="py-24 bg-[#09090b] relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono tracking-[0.25em] uppercase text-amber-400 mb-2">
              <Sparkles size={12} /> Curated Sri Lankan Roster
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
              Featured{' '}
              <span className="italic font-serif font-normal gold-gradient-text">Comp-Cards</span>
            </h2>
            <p className="mt-2 text-zinc-400 max-w-lg text-sm font-light">
              Accredited models and runway titleholders with verified measurements and high-res
              composite portfolios.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-full p-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('carousel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                  viewMode === 'carousel'
                    ? 'bg-amber-400 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sliders size={13} />
                <span>Runway Flow</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                  viewMode === 'grid'
                    ? 'bg-amber-400 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LayoutGrid size={13} />
                <span>Studio Grid</span>
              </button>
            </div>

            <Link
              to="/search"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 hover:text-white transition-colors"
            >
              <span>Full Directory</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-400/20'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards Display: Carousel or Grid */}
        {viewMode === 'carousel' ? (
          <Carousel>
            {filteredTalent.map((model, idx) => (
              <div key={model.id || idx} className="w-[280px] sm:w-[320px]">
                <div onClick={() => onOpenLightbox(model, idx)} className="cursor-pointer">
                  <CompCard model={model} index={idx} />
                </div>
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTalent.map((model, idx) => (
              <div
                key={model.id || idx}
                onClick={() => onOpenLightbox(model, idx)}
                className="cursor-pointer"
              >
                <CompCard model={model} index={idx} />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/search" className="btn-ghost-luxury inline-flex items-center">
            <span>Explore All 5,000+ Models</span>
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function EcosystemSection() {
  const pillars = [
    {
      role: 'MODELS & TALENT',
      title: 'Digital Comp-Cards & Global Scouting',
      desc: 'Create verified multimedia portfolios with high-res editorial galleries, video runway reels, and standardized measurements. Connect directly with casting directors worldwide without agency bias.',
      badge: 'FOR CREATORS',
      bgImg:
        'https://images.unsplash.com/photo-1650421761734-7a7f2baa8b34?q=80&w=800&auto=format&fit=crop',
      link: '/register',
      cta: 'Build Portfolio',
    },
    {
      role: 'INDUSTRY DIRECTORS',
      title: 'Algorithmic Casting & Direct Match Booking',
      desc: 'Launch targeted casting calls with exact demographic, height, and stylistic criteria. Our explainable suitability engine ranks applicants automatically, reducing scouting cycles by 75%.',
      badge: 'FOR RECRUITERS',
      bgImg:
        'https://images.unsplash.com/photo-1684082743582-24dc5558fcd6?q=80&w=800&auto=format&fit=crop',
      link: '/castings/create',
      cta: 'Post Casting Call',
    },
    {
      role: 'PAGEANT ORGANIZATIONS',
      title: 'Institutional Title & Delegate Management',
      desc: 'Manage global pageant franchises, verify national delegates, coordinate multi-round auditions, and track contestant profiles with institutional transparency and cryptographic security.',
      badge: 'FOR ORGANIZERS',
      bgImg:
        'https://images.unsplash.com/photo-1782485480913-132b2644a7bc?q=80&w=800&auto=format&fit=crop',
      link: '/register',
      cta: 'Register Institution',
    },
  ];

  return (
    <section id="ecosystem" className="py-28 bg-zinc-950 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block text-xs font-mono tracking-[0.25em] uppercase text-amber-400 mb-3">
            A Unified Multidimensional Ecosystem
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
            Designed for Every{' '}
            <span className="italic font-serif font-normal gold-gradient-text">
              Industry Stakeholder
            </span>
          </h2>
          <p className="mt-4 text-zinc-400 text-base font-light">
            Moving the fashion, film, and pageantry sectors beyond unverified social media DMs into
            an accredited digital marketplace.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pillars.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -8 }}
              className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-amber-400/50 shadow-2xl transition-all duration-500 flex flex-col justify-end min-h-[480px] p-8"
            >
              <img
                src={p.bgImg}
                alt={p.title}
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-50 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

              <div className="relative z-10 space-y-4">
                <span className="inline-block text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                  {p.badge}
                </span>
                <h3 className="text-2xl font-display font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                  {p.desc}
                </p>

                <div className="pt-3">
                  <Link
                    to={p.link}
                    className="inline-flex items-center text-xs font-mono uppercase tracking-widest text-amber-300 hover:text-white font-semibold transition-colors"
                  >
                    <span>{p.cta}</span>
                    <ArrowRight
                      size={14}
                      className="ml-1.5 transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveCastingSection() {
  const castings = [
    {
      title: 'Colombo Autumn Fashion Week — Runway Lead',
      org: 'Vogue Italia Production',
      country: 'Sri Lanka',
      category: 'Runway',
      compensation: '€2,500 / Day',
      deadline: 'Oct 15, 2026',
      badge: 'URGENT',
      criteria: 'Height 178cm+ · Runway experience',
    },
    {
      title: 'Colombo Fashion Week 2026 Official Opening',
      org: 'CFW Runway Collective',
      country: 'Sri Lanka',
      category: 'Haute Couture',
      compensation: 'Paid Role',
      deadline: 'Nov 02, 2026',
      badge: 'FEATURED',
      criteria: 'Editorial portfolio · High poise',
    },
    {
      title: 'High Jewelry Campaign — Colombo & Kandy',
      org: 'Luxe Global Agency',
      country: 'Sri Lanka',
      category: 'Editorial',
      compensation: '$4,000 Total',
      deadline: 'Oct 28, 2026',
      badge: 'OPEN',
      criteria: 'Fine features · International look',
    },
    {
      title: 'Miss Universe — National Delegate Audition',
      org: 'Miss Universe',
      country: 'Sri Lanka',
      category: 'Pageant',
      compensation: 'Crown & Travel Grant',
      deadline: 'Nov 18, 2026',
      badge: 'OFFICIAL',
      criteria: 'Age 18-28 · Public speaking',
    },
  ];

  return (
    <section className="py-24 bg-[#09090b] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Carousel
          subtitle="Active Production Notices"
          title="Open Industry Casting Calls"
          actionButton={
            <Link
              to="/castings"
              className="text-xs font-mono uppercase tracking-wider text-amber-400 hover:text-white flex items-center gap-1"
            >
              <span>Explore All Castings</span>
              <ArrowRight size={14} />
            </Link>
          }
        >
          {castings.map((c, i) => (
            <div key={i} className="w-[310px] sm:w-[350px]">
              <motion.div
                whileHover={{ y: -6 }}
                className="glass-dark rounded-2xl p-6 border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between h-[270px] shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                      {c.badge}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                      <Clock size={11} className="text-amber-400/70" />
                      {c.deadline}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5 leading-snug hover:text-amber-300 transition-colors line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-2">
                    {c.org} · {c.country}
                  </p>
                  <p className="text-[11px] font-mono text-zinc-500 line-clamp-1">{c.criteria}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold">{c.compensation}</span>
                  <Link
                    to="/castings"
                    className="text-white hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Apply</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </motion.div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

function HauteCoutureCTABanner() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#09090b] via-zinc-950 to-black relative overflow-hidden border-t border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <span className="text-xs font-mono tracking-[0.3em] uppercase text-amber-400 mb-4 block">
          Your Global Runway Awaits
        </span>
        <h2 className="text-4xl sm:text-6xl font-display font-extrabold text-white leading-tight mb-6">
          Step Into The{' '}
          <span className="italic font-serif font-normal gold-gradient-text">Spotlight.</span>
        </h2>
        <p className="max-w-xl mx-auto text-zinc-400 text-sm sm:text-base mb-10 font-light">
          Join thousands of verified models, high-fashion casting agents, and pageant franchises
          building the premier accredited talent marketplace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-gold w-full sm:w-auto">
            <span>Create Verified Profile</span>
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-ghost-luxury w-full sm:w-auto">
            <span>Sign In to Studio</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxItems, setLightboxItems] = useState([]);

  const handleOpenLightbox = (model, index) => {
    const items = editorialFallbacks.map((m) => ({
      url: m.thumbnailUrl,
      title: `${m.fullName} — ${m.category.toUpperCase()}`,
      caption: `${m.country} • Height: ${m.heightCm} cm • B-W-H: ${m.measurements.bust}-${m.measurements.waist}-${m.measurements.hips}`,
    }));
    setLightboxItems(items);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* 1. Full-Bleed Video Background Hero */}
      <VideoHero />

      {/* 2. Agency & Fashion Week Partner Marquee */}
      <BrandMarquee />

      {/* 3. Live Metrics Impact Strip */}
      <MetricsStrip />

      {/* 4. Curated Comp-Card Showcase Roster (With Carousel & Grid View) */}
      <ModelShowcaseSection onOpenLightbox={handleOpenLightbox} />

      {/* 5. The Three Pillars (Multidimensional Ecosystem) */}
      <EcosystemSection />

      {/* 6. Parallax Haute Couture Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ParallaxBanner
          badge="Global Casting Intelligence"
          heading="Where Raw Potential Meets Iconic Vision"
          subheading="A centralized accredited platform designed to replace unverified DMs with verified portfolios, algorithmic matching, and instant auditions."
        />
      </div>

      {/* 7. Live Casting Call Interactive Carousel */}
      <LiveCastingSection />

      {/* 8. Haute Couture Editorial Conversion Banner */}
      <HauteCoutureCTABanner />

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
