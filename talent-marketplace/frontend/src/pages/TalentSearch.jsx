import React, { useState, useEffect } from 'react';
import {
  SearchX,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  Sliders,
  LayoutGrid,
  MapPin,
  Filter,
  Calculator,
  Scale,
  Search,
} from 'lucide-react';
import api from '../api/axiosConfig';
import CompCard from '../components/CompCard';
import Carousel from '../components/Carousel';
import MediaLightbox from '../components/MediaLightbox';
import useCompareStore from '../store/compareStore';

// Editorial fallback profiles if API is empty
const defaultProfiles = [
  {
    _id: 'd1',
    id: 'd1',
    fullName: 'Elena Rostova',
    category: 'runway',
    country: 'France',
    heightCm: 180,
    experience: 'Professional',
    isVerified: true,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    measurements: { bust: 86, waist: 60, hips: 89 },
    eyeColor: 'Hazel',
  },
  {
    _id: 'd2',
    id: 'd2',
    fullName: 'Marcus Vance',
    category: 'editorial',
    country: 'United Kingdom',
    heightCm: 188,
    experience: 'Professional',
    isVerified: true,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
    measurements: { bust: 98, waist: 76, hips: 94 },
    eyeColor: 'Blue',
  },
  {
    _id: 'd3',
    id: 'd3',
    fullName: 'Ananya Senanayake',
    category: 'pageant',
    country: 'Sri Lanka',
    heightCm: 177,
    experience: 'Lead Titleholder',
    isVerified: true,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
    measurements: { bust: 88, waist: 62, hips: 91 },
    eyeColor: 'Dark Brown',
  },
  {
    _id: 'd4',
    id: 'd4',
    fullName: 'Kenji Takahashi',
    category: 'commercial',
    country: 'Japan',
    heightCm: 185,
    experience: 'Experienced',
    isVerified: true,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    measurements: { bust: 96, waist: 75, hips: 93 },
    eyeColor: 'Black',
  },
  {
    _id: 'd5',
    id: 'd5',
    fullName: 'Amara Diop',
    category: 'runway',
    country: 'Senegal',
    heightCm: 182,
    experience: 'Professional',
    isVerified: true,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
    measurements: { bust: 84, waist: 59, hips: 88 },
    eyeColor: 'Brown',
  },
  {
    _id: 'd6',
    id: 'd6',
    fullName: 'Sofia Al-Mansoor',
    category: 'editorial',
    country: 'United Arab Emirates',
    heightCm: 176,
    experience: 'Professional',
    isVerified: true,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
    measurements: { bust: 87, waist: 61, hips: 90 },
    eyeColor: 'Green',
  },
];

function ResultSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 animate-pulse flex flex-col">
      <div className="aspect-[3/4] bg-zinc-800" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-2/3 bg-zinc-800 rounded" />
        <div className="h-3 w-1/2 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

export default function TalentSearch() {
  const [filters, setFilters] = useState({
    country: '',
    category: '',
    minAge: '',
    maxAge: '',
    minHeightCm: '',
    maxHeightCm: '',
  });

  const { selectedTalents, openCompare, openBudgetModal, openCommandPalette } = useCompareStore();
  const [results, setResults] = useState(defaultProfiles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'carousel'
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Initial load: Fetch showcase models so the page is never blank
  useEffect(() => {
    api
      .get('/profiles/showcase')
      .then((res) => {
        if (res.data.data && res.data.data.length > 0) {
          setResults(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await api.get(`/search/talent?${params.toString()}`);
      if (res.data.data) {
        setResults(res.data.data);
      }
    } catch {
      // Graceful fallback: client-side filtering on default profiles
      const clientFiltered = defaultProfiles.filter((p) => {
        if (filters.country && !p.country.toLowerCase().includes(filters.country.toLowerCase()))
          return false;
        if (filters.category && p.category.toLowerCase() !== filters.category.toLowerCase())
          return false;
        if (filters.minHeightCm && p.heightCm < Number(filters.minHeightCm)) return false;
        if (filters.maxHeightCm && p.heightCm > Number(filters.maxHeightCm)) return false;
        return true;
      });
      setResults(clientFiltered);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryQuickFilter = (cat) => {
    const nextCategory = filters.category === cat ? '' : cat;
    setFilters({ ...filters, category: nextCategory });
    setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.country) params.append('country', filters.country);
      if (nextCategory) params.append('category', nextCategory);
      api
        .get(`/search/talent?${params.toString()}`)
        .then((res) => setResults(res.data.data || []))
        .catch(() => {
          setResults(defaultProfiles.filter((p) => !nextCategory || p.category === nextCategory));
        });
    }, 50);
  };

  const resetFilters = () => {
    setFilters({
      country: '',
      category: '',
      minAge: '',
      maxAge: '',
      minHeightCm: '',
      maxHeightCm: '',
    });
    setResults(defaultProfiles);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const categories = ['runway', 'editorial', 'commercial', 'pageant'];

  const lightboxItems = results.map((p) => ({
    url: p.thumbnailUrl || p.photoUrl,
    title: `${p.fullName} — ${p.category?.toUpperCase() || 'TALENT'}`,
    caption: `${p.country || 'International'} • Height: ${p.heightCm || 178} cm • Eyes: ${p.eyeColor || 'Brown'}`,
  }));

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/10 gap-4">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-[0.2em] mb-3">
              <Sparkles size={12} /> Global Casting & Scout Engine
            </span>
            <h1 className="text-3xl sm:text-5xl font-display font-bold">
              Talent{' '}
              <span className="italic font-serif font-normal gold-gradient-text">Directory</span>
            </h1>
            <p className="mt-2 text-zinc-400 text-sm max-w-xl font-light">
              Filter through verified runway models, commercial talents, and pageant titleholders
              with standardized editorial measurements.
            </p>
          </div>

          {/* Action & View Mode Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Scout ⌘K Button */}
            <button
              type="button"
              onClick={openCommandPalette}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-400/40 text-xs font-mono text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <Search size={13} className="text-amber-400" />
              <span>Scout ⌘K</span>
            </button>

            {/* Budget Estimator Button */}
            <button
              type="button"
              onClick={openBudgetModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-xs font-mono text-amber-300 hover:bg-amber-400/20 transition-all cursor-pointer"
            >
              <Calculator size={13} />
              <span>Budget Estimator</span>
            </button>

            {/* If talents selected in tray, show compare button */}
            {selectedTalents.length > 0 && (
              <button
                type="button"
                onClick={openCompare}
                className="btn-gold !py-1.5 !px-3 !text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.3)] animate-pulse"
              >
                <Scale size={13} />
                <span>Compare ({selectedTalents.length})</span>
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-full p-1 text-xs">
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
                <span>Grid</span>
              </button>
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
            </div>
          </div>
        </div>

        {/* Quick Category Chips Bar */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          <button
            type="button"
            onClick={() => handleCategoryQuickFilter('')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
              !filters.category
                ? 'bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:border-white/20'
            }`}
          >
            All Disciplines
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleCategoryQuickFilter(c)}
              className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all capitalize cursor-pointer ${
                filters.category === c
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-400/20'
                  : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:border-white/20'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Main Content: Sidebar Filters + Results Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-72 glass-dark p-6 rounded-2xl border border-white/10 shrink-0 sticky top-28 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h2 className="text-base font-bold font-sans flex items-center gap-2 text-white">
                <SlidersHorizontal size={16} className="text-amber-400" />
                <span>Search Filters</span>
              </h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-mono uppercase text-zinc-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                title="Reset Filters"
              >
                <RefreshCw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {error && (
              <p role="alert" className="text-xs text-rose-400 mb-4">
                {error}
              </p>
            )}

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label
                  htmlFor="search-country"
                  className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1"
                >
                  <MapPin size={11} className="text-amber-400" /> Country
                </label>
                <input
                  id="search-country"
                  type="text"
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="e.g. France, Sri Lanka, Japan"
                />
              </div>

              <div>
                <label
                  htmlFor="search-category"
                  className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1"
                >
                  <Filter size={11} className="text-amber-400" /> Discipline
                </label>
                <select
                  id="search-category"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                >
                  <option value="" className="bg-zinc-900 text-zinc-200">
                    Any Discipline
                  </option>
                  <option value="runway" className="bg-zinc-900 text-zinc-200">
                    Runway & Couture
                  </option>
                  <option value="commercial" className="bg-zinc-900 text-zinc-200">
                    Commercial Campaign
                  </option>
                  <option value="editorial" className="bg-zinc-900 text-zinc-200">
                    High Fashion Editorial
                  </option>
                  <option value="pageant" className="bg-zinc-900 text-zinc-200">
                    Pageant Titleholder
                  </option>
                </select>
              </div>

              {/* Age Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="search-minAge"
                    className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-1"
                  >
                    Min Age
                  </label>
                  <input
                    id="search-minAge"
                    type="number"
                    value={filters.minAge}
                    onChange={(e) => setFilters({ ...filters, minAge: e.target.value })}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="18"
                  />
                </div>
                <div>
                  <label
                    htmlFor="search-maxAge"
                    className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-1"
                  >
                    Max Age
                  </label>
                  <input
                    id="search-maxAge"
                    type="number"
                    value={filters.maxAge}
                    onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="35"
                  />
                </div>
              </div>

              {/* Height Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="search-minHeightCm"
                    className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-1"
                  >
                    Min Ht (cm)
                  </label>
                  <input
                    id="search-minHeightCm"
                    type="number"
                    value={filters.minHeightCm}
                    onChange={(e) => setFilters({ ...filters, minHeightCm: e.target.value })}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="170"
                  />
                </div>
                <div>
                  <label
                    htmlFor="search-maxHeightCm"
                    className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-1"
                  >
                    Max Ht (cm)
                  </label>
                  <input
                    id="search-maxHeightCm"
                    type="number"
                    value={filters.maxHeightCm}
                    onChange={(e) => setFilters({ ...filters, maxHeightCm: e.target.value })}
                    className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="195"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full !py-3 !text-xs !tracking-widest mt-4 cursor-pointer"
              >
                {loading ? 'Scouting Roster...' : 'Apply Filters'}
              </button>
            </form>
          </div>

          {/* Results Area */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono text-zinc-400">
                Displaying <b className="text-white">{results.length}</b> verified talents
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ResultSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                {results.length > 0 ? (
                  viewMode === 'carousel' ? (
                    <Carousel>
                      {results.map((profile, i) => (
                        <div
                          key={profile._id || profile.id || i}
                          className="w-[280px] sm:w-[320px] cursor-pointer"
                          onClick={() => openLightbox(i)}
                        >
                          <CompCard
                            model={{
                              ...profile,
                              id: profile._id || profile.id,
                            }}
                            index={i}
                          />
                        </div>
                      ))}
                    </Carousel>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {results.map((profile, i) => (
                        <div
                          key={profile._id || profile.id || i}
                          onClick={() => openLightbox(i)}
                          className="cursor-pointer"
                        >
                          <CompCard
                            model={{
                              ...profile,
                              id: profile._id || profile.id,
                            }}
                            index={i}
                          />
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 glass-dark rounded-3xl border border-white/10 text-center px-4 shadow-2xl">
                    <SearchX size={48} className="text-amber-400/40 mb-4" />
                    <h3 className="text-lg font-bold font-sans text-white mb-2">
                      No Profiles Matched
                    </h3>
                    <p className="text-zinc-400 text-xs max-w-sm mb-6">
                      Try broadening your height, age, or category criteria to discover more models.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="btn-ghost-luxury !text-xs !py-2 cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
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
