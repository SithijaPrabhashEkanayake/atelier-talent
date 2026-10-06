import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Calculator,
  Compass,
  Film,
  ShieldCheck,
  Volume2,
  VolumeX,
  ArrowRight,
  X,
  User,
  Sliders,
} from 'lucide-react';
import useCompareStore from '../store/compareStore';
import soundFX from '../utils/soundEffects';

const QUICK_TALENTS = [
  {
    id: 'd1',
    name: 'Shazna Balasuriya',
    role: 'Runway / Colombo',
    category: 'runway',
    height: '180cm',
    country: 'Sri Lanka',
    link: '/search',
  },
  {
    id: 'd2',
    name: 'Kavindu De Silva',
    role: 'Editorial / Kandy',
    category: 'editorial',
    height: '188cm',
    country: 'Sri Lanka',
    link: '/search',
  },
  {
    id: 'd3',
    name: 'Dilini Fernando',
    role: 'Pageant Titleholder',
    category: 'pageant',
    height: '177cm',
    country: 'Sri Lanka',
    link: '/search',
  },
  {
    id: 'd4',
    name: 'Ruwan Jayasuriya',
    role: 'Commercial / Galle',
    category: 'commercial',
    height: '185cm',
    country: 'Sri Lanka',
    link: '/search',
  },
  {
    id: 'd5',
    name: 'Ashani Wickramarathne',
    role: 'Haute Couture / Negombo',
    category: 'runway',
    height: '182cm',
    country: 'Sri Lanka',
    link: '/search',
  },
];

const QUICK_ACTIONS = [
  {
    id: 'a1',
    title: 'Talent Scout Directory',
    subtitle: 'Search verified models with measurement filters',
    icon: Compass,
    link: '/search',
  },
  {
    id: 'a2',
    title: 'Casting Call Board',
    subtitle: 'Browse active runway, editorial & commercial briefs',
    icon: Film,
    link: '/castings',
  },
  {
    id: 'a3',
    title: 'Couture Budget Estimator',
    subtitle: 'Interactive day-rate & licensing cost calculator',
    icon: Calculator,
    action: 'open_budget',
  },
  {
    id: 'a4',
    title: 'Post New Casting Call',
    subtitle: 'Publish targeted casting with demographic criteria',
    icon: Sliders,
    link: '/castings/create',
  },
  {
    id: 'a5',
    title: 'Admin Analytics Engine',
    subtitle: 'Recharts interactive metrics and pipeline funnel',
    icon: ShieldCheck,
    link: '/admin',
  },
];

export default function CommandPalette() {
  const navigate = useNavigate();
  const { isCommandPaletteOpen, closeCommandPalette, openBudgetModal } = useCompareStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [soundActive, setSoundActive] = useState(soundFX.isEnabled());
  const inputRef = useRef(null);

  // Global keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        useCompareStore.getState().toggleCommandPalette();
      } else if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        useCompareStore.getState().openCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Filter items
  const filteredTalents = QUICK_TALENTS.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.role.toLowerCase().includes(query.toLowerCase()) ||
      t.country.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredActions = QUICK_ACTIONS.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase()),
  );

  const totalItems = [...filteredActions, ...filteredTalents];

  const handleSelect = (item) => {
    soundFX.playTick();
    closeCommandPalette();
    if (item.action === 'open_budget') {
      openBudgetModal();
    } else if (item.link) {
      navigate(item.link);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      soundFX.playTick();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      soundFX.playTick();
      setSelectedIndex((prev) => (prev - 1 + totalItems.length) % Math.max(1, totalItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (totalItems[selectedIndex]) {
        handleSelect(totalItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      closeCommandPalette();
    }
  };

  const toggleSound = () => {
    const next = soundFX.toggle();
    setSoundActive(next);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeCommandPalette}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-start justify-center pt-[12vh] px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#0e0e12] border border-amber-400/40 rounded-3xl shadow-[0_25px_80px_rgba(212,175,55,0.25)] overflow-hidden flex flex-col"
        >
          {/* Search Header Bar */}
          <div className="flex items-center px-6 py-4.5 border-b border-white/10 gap-3">
            <Search size={20} className="text-amber-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search models, castings, actions, or press ⌘K…"
              className="w-full bg-transparent text-white placeholder-zinc-500 font-sans text-base focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="text-zinc-500 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            )}
            <div className="flex items-center gap-2 pl-3 border-l border-white/10 shrink-0">
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                  soundActive
                    ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                    : 'bg-white/5 text-zinc-500 hover:text-zinc-300'
                }`}
                title="Toggle Haute Couture Sound Effects"
              >
                {soundActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span className="hidden sm:inline text-[10px] uppercase font-bold">
                  {soundActive ? 'Audio ON' : 'Muted'}
                </span>
              </button>
              <kbd className="px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 rounded">
                ESC
              </kbd>
            </div>
          </div>

          {/* Quick Filter Result Categories */}
          <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
            {/* Quick Actions Section */}
            {filteredActions.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                  <Sparkles size={11} /> Studio Commands & Tools
                </div>
                <div className="space-y-1 mt-1">
                  {filteredActions.map((action, idx) => {
                    const isSelected = selectedIndex === idx;
                    const Icon = action.icon;
                    return (
                      <div
                        key={action.id}
                        onClick={() => handleSelect(action)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-400/20 to-transparent border border-amber-400/50 text-white shadow-lg'
                            : 'hover:bg-white/5 text-zinc-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? 'bg-amber-400 text-zinc-950 font-bold'
                                : 'bg-white/5 text-amber-400'
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-white">{action.title}</div>
                            <div className="text-xs text-zinc-400">{action.subtitle}</div>
                          </div>
                        </div>
                        <ArrowRight
                          size={15}
                          className={`transition-transform ${
                            isSelected ? 'text-amber-400 translate-x-1' : 'text-zinc-600'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Models & Talents Section */}
            {filteredTalents.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                  <User size={11} /> Featured Models & Titleholders
                </div>
                <div className="space-y-1 mt-1">
                  {filteredTalents.map((talent, idx) => {
                    const overallIdx = filteredActions.length + idx;
                    const isSelected = selectedIndex === overallIdx;
                    return (
                      <div
                        key={talent.id}
                        onClick={() => handleSelect(talent)}
                        onMouseEnter={() => setSelectedIndex(overallIdx)}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-400/20 to-transparent border border-amber-400/50 text-white shadow-lg'
                            : 'hover:bg-white/5 text-zinc-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 font-display italic font-bold">
                            {talent.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-white">{talent.name}</div>
                            <div className="text-xs text-zinc-400 flex items-center gap-2">
                              <span>{talent.role}</span>
                              <span className="text-zinc-600">•</span>
                              <span className="font-mono text-[11px] text-amber-300">
                                {talent.height}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                          {talent.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {totalItems.length === 0 && (
              <div className="py-12 text-center text-zinc-500">
                <p className="text-sm">No results found matching "{query}"</p>
                <p className="text-xs mt-1 text-zinc-600">
                  Try searching "runway", "paris", "calculator", or "casting"
                </p>
              </div>
            )}
          </div>

          {/* Footer Shortcuts Guide */}
          <div className="px-6 py-3 border-t border-white/5 bg-black/40 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-zinc-300">
                  ↑↓
                </kbd>{' '}
                navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-zinc-300">
                  ↵
                </kbd>{' '}
                select
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-zinc-300">
                  esc
                </kbd>{' '}
                close
              </span>
            </div>
            <span className="text-amber-400/80 font-serif italic">Atelier Omnibox HUD</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
