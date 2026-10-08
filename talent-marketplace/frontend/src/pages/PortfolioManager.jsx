import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Trash2,
  ImagePlus,
  Star,
  Sparkles,
  Eye,
  AlertTriangle,
  Film,
  Camera,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axiosConfig';
import MediaLightbox from '../components/MediaLightbox';

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[4/5] rounded-2xl bg-zinc-900/80 border border-white/5 animate-pulse"
        />
      ))}
    </div>
  );
}

export default function PortfolioManager() {
  const { user } = useAuthStore();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({ type: 'photo', category: 'runway', file: null });
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchPortfolio = useCallback(async (isMountedRef) => {
    try {
      const response = await api.get('/profiles/me');
      if (response.data.data) {
        const portRes = await api.get(`/portfolio/${response.data.data._id}`);
        if (isMountedRef.current) setPortfolio(portRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load portfolio', err);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isMountedRef = { current: true };
    fetchPortfolio(isMountedRef);
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchPortfolio]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData((prev) => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setUploadData((prev) => ({ ...prev, file }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      setError('Please select an image or video file to upload.');
      return;
    }
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('type', uploadData.type);
    formData.append('category', uploadData.category);

    try {
      await api.post('/portfolio/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchPortfolio();
      setUploadData({ type: 'photo', category: 'runway', file: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please check file size and format.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this editorial asset from your portfolio?')) return;
    try {
      await api.delete(`/portfolio/${itemId}`);
      setPortfolio((prev) => prev.filter((p) => p._id !== itemId));
    } catch (err) {
      console.error(err);
      setError('Delete failed. Please try again.');
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (user?.role !== 'model') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle size={40} className="text-amber-400 mb-4" />
        <h2 className="text-2xl font-display font-bold text-white mb-2">Exclusive Talent Portal</h2>
        <p className="text-zinc-400 text-sm max-w-md">
          The multimedia portfolio atelier is available exclusively to registered model profiles.
        </p>
      </div>
    );
  }

  const lightboxItems = portfolio.map((item) => ({
    url: item.mediaUrl,
    title: item.title || `${item.category.toUpperCase()} ASSET`,
    caption: `Media Type: ${item.type} • Uploaded: ${new Date(item.uploadedAt).toLocaleDateString()}`,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-[0.2em] mb-3">
            <Sparkles size={12} /> Multimedia Atelier
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Portfolio{' '}
            <span className="gold-gradient-text italic font-serif font-normal">Management</span>
          </h1>
          <p className="mt-2 text-zinc-400 text-sm font-light">
            Curate your composite cards, runway audition tapes, and high-fashion editorial imagery
            for casting directors.
          </p>
        </div>

        <div className="text-xs font-mono text-amber-400/80 bg-amber-400/10 px-4 py-2 rounded-xl border border-amber-400/20">
          <span>
            {portfolio.length} {portfolio.length === 1 ? 'EDITORIAL ASSET' : 'EDITORIAL ASSETS'}{' '}
            ONLINE
          </span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
        >
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Haute Couture Upload Section */}
      <div className="glass-dark rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl mb-12">
        <form
          onSubmit={handleUpload}
          className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-end"
        >
          {/* Dropzone */}
          <label
            htmlFor="portfolio-file"
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
              dragActive
                ? 'border-amber-400 bg-amber-400/10'
                : uploadData.file
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-white/15 bg-zinc-900/50 hover:border-amber-400/50 hover:bg-zinc-900/80'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                uploadData.file
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-400/10 text-amber-400'
              }`}
            >
              <UploadCloud size={24} />
            </div>
            <div className="text-center sm:text-left">
              <span className="text-sm font-medium text-white block truncate max-w-sm">
                {uploadData.file
                  ? uploadData.file.name
                  : 'Drop photo or video here, or browse files'}
              </span>
              <span className="text-[11px] font-mono text-zinc-500 block mt-0.5">
                PNG, JPG, WEBP, or MP4 (Cloudinary CDN Optimized)
              </span>
            </div>
            <input
              id="portfolio-file"
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
          </label>

          {/* Type Selector */}
          <div className="w-full lg:w-36">
            <label
              htmlFor="portfolio-type"
              className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1"
            >
              <Camera size={12} className="text-amber-400" /> Media Type
            </label>
            <select
              id="portfolio-type"
              value={uploadData.type}
              onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="photo" className="bg-zinc-900 text-zinc-200">
                Photo
              </option>
              <option value="video" className="bg-zinc-900 text-zinc-200">
                Video Reel
              </option>
            </select>
          </div>

          {/* Category Selector */}
          <div className="w-full lg:w-44">
            <label
              htmlFor="portfolio-category"
              className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1"
            >
              <Sparkles size={12} className="text-amber-400" /> Category
            </label>
            <select
              id="portfolio-category"
              value={uploadData.category}
              onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="runway" className="bg-zinc-900 text-zinc-200">
                Runway & Couture
              </option>
              <option value="commercial" className="bg-zinc-900 text-zinc-200">
                Commercial Campaign
              </option>
              <option value="editorial" className="bg-zinc-900 text-zinc-200">
                High Fashion Editorial
              </option>
              <option value="headshot" className="bg-zinc-900 text-zinc-200">
                Official Headshot
              </option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className="btn-gold whitespace-nowrap h-[42px] px-6"
          >
            <ImagePlus size={15} className="mr-2" />
            <span>{uploading ? 'Archiving to CDN…' : 'Publish Asset'}</span>
          </button>
        </form>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <GallerySkeleton />
      ) : portfolio.length === 0 ? (
        <div className="glass-dark rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-4">
            <ImagePlus size={28} />
          </div>
          <h3 className="text-xl font-display font-semibold text-white mb-1">
            Your Portfolio is Empty
          </h3>
          <p className="text-zinc-400 text-xs font-light max-w-sm mb-6">
            Upload your professional comp-card imagery or runway video reel above to make your
            profile cast-ready.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {portfolio.map((item, i) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-amber-400/50 shadow-xl transition-all duration-300"
              >
                {/* Cover Asset Tag */}
                {i === 0 && (
                  <span className="absolute top-3 left-3 z-20 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-zinc-950 text-[10px] font-mono font-bold rounded-full shadow-lg">
                    <Star size={11} fill="currentColor" /> PRIMARY COVER
                  </span>
                )}

                {/* Media Presentation */}
                <div
                  className="aspect-[4/5] w-full overflow-hidden bg-zinc-900 cursor-pointer"
                  onClick={() => openLightbox(i)}
                >
                  {item.type === 'photo' ? (
                    <img
                      src={item.mediaUrl}
                      alt={item.category ? `Portfolio ${item.category}` : 'Portfolio asset'}
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
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-amber-400/90 text-zinc-950 flex items-center justify-center">
                          <Film size={20} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Quick Inspection & Action Controls */}
                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    type="button"
                    onClick={() => openLightbox(i)}
                    aria-label="Inspect asset"
                    className="p-2 rounded-full bg-black/60 border border-white/20 text-white hover:border-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    aria-label="Delete item"
                    className="p-2 rounded-full bg-black/60 border border-white/20 text-white hover:border-rose-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Bottom Asset Caption */}
                <div className="absolute bottom-0 inset-x-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Full-Screen Media Lightbox Modal */}
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
