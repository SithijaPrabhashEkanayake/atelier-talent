import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MediaLightbox({
  isOpen,
  onClose,
  items = [],
  currentIndex = 0,
  onNavigate,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0 && onNavigate) {
        onNavigate(currentIndex - 1);
      }
      if (e.key === 'ArrowRight' && currentIndex < items.length - 1 && onNavigate) {
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex, items.length, onClose, onNavigate]);

  if (!isOpen || !items.length) return null;

  const currentItem = items[currentIndex] || {};
  const mediaUrl = currentItem.url || currentItem.mediaUrl || currentItem.thumbnailUrl;
  const isVideo =
    currentItem.mediaType === 'video' ||
    (typeof mediaUrl === 'string' && mediaUrl.endsWith('.mp4'));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-8"
        onClick={onClose}
      >
        {/* Top Control Bar */}
        <div
          className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-50 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
              Editorial Portfolio
            </span>
            <span className="text-xs font-mono text-zinc-400">
              {currentIndex + 1} / {items.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white hover:border-amber-400/60 flex items-center justify-center transition-all"
              aria-label="Close viewer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Media Container */}
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-5xl max-h-[80vh] w-full flex flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
            />
          ) : (
            <img
              src={mediaUrl}
              alt={currentItem.title || `Portfolio item ${currentIndex + 1}`}
              className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
            />
          )}

          {/* Caption & Metadata Footer */}
          {(currentItem.title || currentItem.caption || currentItem.category) && (
            <div className="mt-4 text-center max-w-xl">
              {currentItem.title && (
                <h4 className="text-white font-display text-lg font-semibold tracking-wide">
                  {currentItem.title}
                </h4>
              )}
              {currentItem.caption && (
                <p className="text-zinc-400 text-xs mt-1 font-sans">{currentItem.caption}</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && onNavigate && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex - 1);
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900/80 border border-white/15 text-white hover:border-amber-400 hover:bg-amber-400/10 flex items-center justify-center transition-all z-40"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {currentIndex < items.length - 1 && onNavigate && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex + 1);
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900/80 border border-white/15 text-white hover:border-amber-400 hover:bg-amber-400/10 flex items-center justify-center transition-all z-40"
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
