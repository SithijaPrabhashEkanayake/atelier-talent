import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
      {/* Ambient gold mesh */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, #d4af37 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative z-10"
      >
        {/* Large 404 */}
        <h1 className="text-[10rem] sm:text-[14rem] font-black leading-none bg-gradient-to-b from-[#d4af37]/30 to-transparent bg-clip-text text-transparent select-none">
          404
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-zinc-200 mb-3 -mt-6">Page Not Found</h2>
          <p className="text-zinc-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            The page you're looking for doesn't exist, or the runway has moved to a new location.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8962e] hover:from-[#e5c349] hover:to-[#d4af37] text-black font-bold rounded-xl transition-all shadow-lg shadow-[#d4af37]/10"
          >
            <ArrowLeft size={16} />
            Return to Runway
          </Link>
        </motion.div>
      </motion.div>

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(212,175,55,0.5) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />
    </div>
  );
}
