import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Carousel({ children, title, subtitle, actionButton, className = '' }) {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [children]);

  const scroll = (direction) => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Header section with titles and controls */}
      {(title || subtitle || actionButton) && (
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 px-1">
          <div>
            {subtitle && (
              <p className="text-amber-400 font-mono text-xs uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                {title}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-4">
            {actionButton}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  canScrollLeft
                    ? 'border-white/20 bg-zinc-900/80 text-white hover:border-amber-400/80 hover:bg-amber-400/10 hover:text-amber-300'
                    : 'border-white/5 bg-zinc-900/30 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  canScrollRight
                    ? 'border-white/20 bg-zinc-900/80 text-white hover:border-amber-400/80 hover:bg-amber-400/10 hover:text-amber-300'
                    : 'border-white/5 bg-zinc-900/30 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Track */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory focus:outline-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {React.Children.map(children, (child, idx) => (
          <motion.div
            key={idx}
            className="flex-shrink-0 snap-start"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
          >
            {child}
          </motion.div>
        ))}
      </div>

      {/* Subtle edge fades */}
      {canScrollLeft && (
        <div className="absolute left-0 top-16 bottom-4 w-12 bg-gradient-to-r from-[#09090b] to-transparent pointer-events-none z-10" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-16 bottom-4 w-12 bg-gradient-to-l from-[#09090b] to-transparent pointer-events-none z-10" />
      )}
    </div>
  );
}
