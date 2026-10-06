import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function ParallaxBanner({
  badge = 'Haute Couture Scouting',
  heading = 'Where Raw Potential Meets Iconic Vision',
  subheading = 'Connect with top-tier fashion houses, global casting directors, and prestigious pageant organizations on the premier verified marketplace.',
  primaryCtaText = 'Explore Casting Board',
  primaryCtaLink = '/castings',
  secondaryCtaText = 'Discover Talent',
  secondaryCtaLink = '/search',
  backgroundImage = 'https://images.unsplash.com/photo-1684082744089-c3b5bdb7db8c?q=80&w=1800&auto=format&fit=crop',
}) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Parallax offsets
  const bgY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['25px', '-25px']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);

  return (
    <section
      ref={containerRef}
      className="theme-invariant relative w-full min-h-[550px] md:min-h-[640px] flex items-center justify-center overflow-hidden my-16 rounded-3xl border border-white/10 shadow-2xl"
    >
      {/* Parallax Background Layer */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 w-full h-[130%] -top-[15%] scale-105 pointer-events-none"
      >
        <img
          src={backgroundImage}
          alt="High fashion editorial background"
          className="w-full h-full object-cover object-center filter brightness-40 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/95 via-[#09090b]/70 to-[#09090b]/95" />
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-black/60" />
      </motion.div>

      {/* Floating Gold Mesh Light Flares */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-amber-300/10 blur-3xl pointer-events-none" />

      {/* Parallax Content Layer */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center flex flex-col items-center"
      >
        {/* Editorial Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono tracking-[0.2em] uppercase mb-6 backdrop-blur-md"
        >
          <Sparkles size={14} className="text-amber-400 animate-spin-slow" />
          <span>{badge}</span>
        </motion.div>

        {/* Display Typography */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold text-white tracking-tight leading-[1.1] mb-6">
          <span className="block">{heading.split('Meets')[0]}</span>
          <span className="gold-gradient-text italic font-normal">
            Meets {heading.split('Meets')[1] || 'Iconic Vision'}
          </span>
        </h2>

        <p className="text-zinc-300 text-base md:text-lg max-w-2xl font-sans font-light leading-relaxed mb-10">
          {subheading}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to={primaryCtaLink} className="btn-gold group">
            <span>{primaryCtaText}</span>
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to={secondaryCtaLink} className="btn-ghost-luxury">
            {secondaryCtaText}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
