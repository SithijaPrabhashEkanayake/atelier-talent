import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Volume2, VolumeX } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function VideoHero() {
  const { isAuthenticated } = useAuthStore();
  const [isMuted, setIsMuted] = useState(true);

  // High-fashion stock video reel (royalty-free CDN high-quality fashion runway loop)
  const videoUrl =
    'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-runway-show-34351-large.mp4';
  const fallbackPoster =
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1920&auto=format&fit=crop';

  return (
    <section className="theme-invariant relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#09090b]">
      {/* Background Video Reel */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted={isMuted}
          playsInline
          poster={fallbackPoster}
          className="w-full h-full object-cover object-center opacity-40 scale-105 filter brightness-90 contrast-110 transition-transform duration-1000"
        >
          <source src={videoUrl} type="video/mp4" />
          {/* Fallback image if video is not supported */}
          <img
            src={fallbackPoster}
            alt="High Fashion Model"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Ambient Dark & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Floating Audio / Video Control */}
      <div className="absolute top-6 right-6 z-20 hidden md:flex items-center gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-zinc-300 hover:text-amber-400 border border-white/10 backdrop-blur-md transition-all text-xs flex items-center gap-1.5"
          title={isMuted ? 'Unmute Ambient Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          <span className="text-[11px] font-mono tracking-wider">
            {isMuted ? 'SOUND OFF' : 'SOUND ON'}
          </span>
        </button>
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Subtle Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono tracking-[0.2em] uppercase mb-8 backdrop-blur-md"
        >
          <Sparkles size={13} className="text-amber-400 animate-pulse" />
          <span>The Global Creative & Casting Ecosystem</span>
        </motion.div>

        {/* Main Editorial Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight text-white leading-[1.08] mb-6"
        >
          Where High Fashion <br />
          <span className="italic font-serif font-normal gold-gradient-text">Meets Discovery.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-zinc-300 font-sans font-light leading-relaxed mb-10"
        >
          Unifying professional models, world-class casting directors, and prestige pageant
          organizers. Discover verified talent and launch extraordinary productions worldwide.
        </motion.p>

        {/* Primary Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-gold w-full sm:w-auto">
              <span>Go to Your Studio</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-gold w-full sm:w-auto">
                <span>Join The Network</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link to="/castings" className="btn-ghost-luxury w-full sm:w-auto">
                <span>Explore Casting Calls</span>
              </Link>
            </>
          )}
        </motion.div>

        {/* Live Floating Casting Call Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="glass-dark rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-semibold">Live Casting Calls:</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-sans text-zinc-300 flex-wrap justify-center">
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5 hover:border-amber-400/40 transition-colors">
                ✨ <b>Vogue Runway Fall 2026</b> · Milan
              </span>
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5 hover:border-amber-400/40 transition-colors">
                🔥 <b>Colombo Fashion Week Lead</b> · Sri Lanka
              </span>
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5 hover:border-amber-400/40 transition-colors">
                👑 <b>Miss Universe Delegate</b> · Colombo
              </span>
            </div>

            <Link
              to="/castings"
              className="text-xs font-semibold text-amber-300 hover:text-white flex items-center gap-1 uppercase tracking-wider font-mono hover:underline"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Subtle Bottom Ambient Gradient */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none" />
    </section>
  );
}
