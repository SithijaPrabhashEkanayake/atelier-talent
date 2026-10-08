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

const COUNTRY_OPTIONS = ['Sri Lanka'];

const DISCIPLINE_OPTIONS = [
  { value: 'runway', label: 'Runway & Couture' },
  { value: 'commercial', label: 'Commercial Campaign' },
  { value: 'editorial', label: 'High Fashion Editorial' },
  { value: 'pageant', label: 'Pageant Titleholder' },
];

const AGE_RANGE_OPTIONS = [
  { value: '18-25', label: '18 – 25' },
  { value: '26-35', label: '26 – 35' },
];

const HEIGHT_RANGE_OPTIONS = [
  { value: '160-170', label: '160 – 170 cm' },
  { value: '171-180', label: '171 – 180 cm' },
  { value: '181-195', label: '181 – 195 cm' },
];

const EMPTY_FILTERS = {
  country: '',
  category: '',
  ageRange: '',
  heightRange: '',
};

const buildSearchParams = (filters) => {
  const params = new URLSearchParams();
  if (filters.country) params.set('country', filters.country);
  if (filters.category) params.set('category', filters.category);
  if (filters.ageRange) {
    const [minAge, maxAge] = filters.ageRange.split('-');
    params.set('minAge', minAge);
    params.set('maxAge', maxAge);
  }
  if (filters.heightRange) {
    const [minHeightCm, maxHeightCm] = filters.heightRange.split('-');
    params.set('minHeightCm', minHeightCm);
    params.set('maxHeightCm', maxHeightCm);
  }
  return params;
};

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
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const { selectedTalents, openCompare, openBudgetModal, openCommandPalette } = useCompareStore();
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'carousel'
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const runSearch = async (nextFilters, pageNumber = 1, append = false) => {
    setError('');
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const params = buildSearchParams(nextFilters);
      params.set('page', pageNumber);
      params.set('limit', 12);
      const res = await api.get(`/search/talent?${params.toString()}`);
      const data = res.data.data || [];
      setResults((prev) => (append ? [...prev, ...data] : data));
      setPage(pageNumber);
      setTotal(res.data.meta?.totalItems ?? data.length);
      setTotalPages(res.data.meta?.totalPages ?? 1);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        try {
          const featured = await api.get('/profiles/showcase');
          const data = featured.data.data || [];
          setResults(data);
          setTotal(data.length);
        } catch {
          setResults([]);
          setTotal(0);
        }
        setPage(1);
        setTotalPages(1);
        setError('Sign in as a casting or pageant organiser to filter the full directory. Showing featured talent.');
      } else {
        setResults([]);
        setTotal(0);
        setError('Could not load talent right now. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    runSearch(EMPTY_FILTERS);
    // Runs once on mount; the search reads only constants and state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = () => runSearch(filters, page + 1, true);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    runSearch(filters);
  };

  const handleCategoryQuickFilter = (cat) => {
    const nextFilters = { ...filters, category: filters.category === cat ? '' : cat };
    setFilters(nextFilters);
    runSearch(nextFilters);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    runSearch(EMPTY_FILTERS);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const categories = ['runway', 'editorial', 'commercial', 'pageant'];

  const lightboxItems = results.map((p) => ({
    url: p.thumbnailUrl || p.photoUrl,
    title: `${p.fullName} ${p.category?.toUpperCase() || 'TALENT'}`,
    caption: [p.country || 'International', p.heightCm ? `Height: ${p.heightCm} cm` : null]
      .filter(Boolean)
      .join(' • '),
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
                <select
                  id="search-country"
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                >
                  <option value="" className="bg-zinc-900 text-zinc-200">
                    Any country
                  </option>
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c} value={c} className="bg-zinc-900 text-zinc-200">
                      {c}
                    </option>
                  ))}
                </select>
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
                  {DISCIPLINE_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value} className="bg-zinc-900 text-zinc-200">
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="search-ageRange"
                  className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-1"
                >
                  Age
                </label>
                <select
                  id="search-ageRange"
                  value={filters.ageRange}
                  onChange={(e) => setFilters({ ...filters, ageRange: e.target.value })}
                  className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                >
                  <option value="" className="bg-zinc-900 text-zinc-200">
                    Any age
                  </option>
                  {AGE_RANGE_OPTIONS.map((a) => (
                    <option key={a.value} value={a.value} className="bg-zinc-900 text-zinc-200">
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="search-heightRange"
                  className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-1"
                >
                  Height
                </label>
                <select
                  id="search-heightRange"
                  value={filters.heightRange}
                  onChange={(e) => setFilters({ ...filters, heightRange: e.target.value })}
                  className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                >
                  <option value="" className="bg-zinc-900 text-zinc-200">
                    Any height
                  </option>
                  {HEIGHT_RANGE_OPTIONS.map((h) => (
                    <option key={h.value} value={h.value} className="bg-zinc-900 text-zinc-200">
                      {h.label}
                    </option>
                  ))}
                </select>
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
                Displaying <b className="text-white">{results.length}</b> of{' '}
                <b className="text-white">{total}</b> verified talents
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

                {!loading && page < totalPages && (
                  <div className="flex justify-center mt-10">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="btn-gold !text-xs !py-3 !px-6 disabled:opacity-60 cursor-pointer"
                    >
                      {loadingMore ? 'Loading…' : 'Load more talent'}
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
