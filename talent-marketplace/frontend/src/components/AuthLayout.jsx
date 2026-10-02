import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';

// Shared visual shell for every auth page (Login/Register/Forgot/Reset) — a
// luxury split screen with a live photo collage on one side and a glassmorphic
// dark form panel on the other, all in the Obsidian & Gold Haute Couture aesthetic.
export default function AuthLayout({ eyebrow, title, tagline, children }) {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    api
      .get('/profiles/showcase')
      .then((res) => setPhotos((res.data.data || []).filter((p) => p.thumbnailUrl).slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      {/* Visual panel — Obsidian & Gold couture aesthetic */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#09090b] text-white p-10">
        {/* Ambient gold gradient mesh */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            background:
              'radial-gradient(ellipse at 20% 80%, #d4af37 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #d4af37 0%, transparent 50%)',
          }}
          aria-hidden="true"
        />
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(212,175,55,0.4) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden="true"
        />

        <Link to="/" className="relative z-10 text-xl font-extrabold tracking-tight">
          TALENT<span className="text-[#d4af37]">MARKET</span>
        </Link>

        <div className="relative z-10">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#d4af37] mb-3">
            {eyebrow}
          </p>
          <h2 className="text-3xl font-extrabold leading-tight mb-3 text-balance">{title}</h2>
          <p className="text-zinc-400 max-w-sm text-sm leading-relaxed">{tagline}</p>
        </div>

        {/* Photo collage */}
        <div className="relative z-10 flex gap-3 h-40">
          {photos.length > 0
            ? photos.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="relative rounded-xl overflow-hidden shadow-2xl shrink-0 ring-1 ring-white/10"
                  style={{ width: i === 2 ? 100 : 72, marginTop: i % 2 === 0 ? 16 : 0 }}
                >
                  <img src={p.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                </motion.div>
              ))
            : Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/5 shrink-0 ring-1 ring-white/5"
                  style={{ width: i === 2 ? 100 : 72 }}
                />
              ))}
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Form panel — dark glassmorphic */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-[#0e0e11]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
