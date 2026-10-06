import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Search,
  Volume2,
  VolumeX,
  Calculator,
  Sun,
  Moon,
} from 'lucide-react';
import io from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useCompareStore from '../store/compareStore';
import useThemeStore from '../store/themeStore';
import soundFX from '../utils/soundEffects';
import api, { getAccessToken } from '../api/axiosConfig';

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center px-2 py-1 text-xs font-mono tracking-wider uppercase transition-all duration-300 ${
    isActive
      ? 'text-amber-400 font-semibold border-b-2 border-amber-400 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]'
      : 'text-zinc-400 hover:text-white hover:border-b-2 hover:border-white/30'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block px-3 py-3 rounded-lg text-sm font-mono tracking-wide uppercase transition-colors ${
    isActive
      ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 font-semibold'
      : 'text-zinc-300 hover:bg-white/5'
  }`;

function NavLinks({ user, mobile = false, onNavigate }) {
  const cls = mobile ? mobileLinkClass : navLinkClass;
  const links = (
    <div className={mobile ? 'space-y-1' : 'flex items-center space-x-6'}>
      <NavLink to="/dashboard" className={cls}>
        Dashboard
      </NavLink>
      <NavLink to="/profile/edit" className={cls}>
        Profile
      </NavLink>
      {user?.role === 'model' && (
        <>
          <NavLink to="/portfolio" className={cls}>
            Portfolio
          </NavLink>
          <NavLink to="/applications" className={cls}>
            Applications
          </NavLink>
        </>
      )}
      {(user?.role === 'industry_professional' ||
        user?.role === 'pageant_organizer' ||
        user?.role === 'admin') && (
        <NavLink to="/search" className={cls}>
          Talent Scout
        </NavLink>
      )}
      <NavLink to="/castings" className={cls}>
        Castings
      </NavLink>
    </div>
  );
  return mobile ? <div onClick={onNavigate}>{links}</div> : links;
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { openCommandPalette, openBudgetModal } = useCompareStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);
  const [soundOn, setSoundOn] = useState(soundFX.isEnabled());

  const toggleSound = () => {
    const next = soundFX.toggle();
    setSoundOn(next);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial count fetch
    api
      .get('/notifications/me')
      .then((res) => setUnreadCount((res.data.data || []).filter((n) => !n.read).length))
      .catch(() => {});

    // WebSocket live event listener for instant real-time toasts
    const token = getAccessToken();
    if (!token) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.DEV ? 'http://localhost:5000' : undefined);
    const socket = io(socketUrl, {
      auth: (cb) => cb({ token: getAccessToken() }),
    });

    socket.on('notification:new', (notif) => {
      setUnreadCount((prev) => prev + 1);
      setActiveToast(notif);
    });

    socket.on('application:status_changed', (payload) => {
      setActiveToast({
        message: payload.message,
        link: '/applications',
      });
    });

    socket.on('casting:updated', (payload) => {
      setActiveToast({
        message: payload.message,
        link: '/castings',
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => setActiveToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate('/');
  };

  const roleLabels = {
    model: 'MODEL',
    industry_professional: 'DIRECTOR',
    pageant_organizer: 'ORGANIZER',
    admin: 'ADMIN',
  };

  return (
    <>
      <nav className="sticky top-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo & Brand Identity */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center gap-2 group">
                <span className="text-2xl font-display font-extrabold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  ATELIER
                </span>
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase px-1.5 py-0.5 rounded border border-amber-400/40 bg-amber-400/10 text-amber-300">
                  TALENT
                </span>
              </Link>

              {/* Authenticated Links (Desktop) */}
              {isAuthenticated ? (
                <div className="hidden lg:flex items-center pl-4 border-l border-white/10">
                  <NavLinks user={user} />
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-6 pl-4 border-l border-white/10 text-xs font-mono tracking-wider uppercase text-zinc-400">
                  <Link to="/castings" className="hover:text-amber-300 transition-colors">
                    Casting Board
                  </Link>
                  <Link to="/search" className="hover:text-amber-300 transition-colors">
                    Scout Talent
                  </Link>
                  <a href="/#ecosystem" className="hover:text-amber-300 transition-colors">
                    The Ecosystem
                  </a>
                </div>
              )}
            </div>

            {/* Right Action Controls */}
            <div className="hidden lg:flex lg:items-center space-x-3">
              {/* Global Quick Scout ⌘K Button */}
              <button
                type="button"
                onClick={openCommandPalette}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-400/40 text-xs text-zinc-400 hover:text-white transition-all cursor-pointer group"
                title="Open Global Command Palette (⌘K or /)"
              >
                <Search
                  size={13}
                  className="text-amber-400 group-hover:scale-110 transition-transform"
                />
                <span className="font-mono text-[11px] tracking-wide">Quick Scout</span>
                <kbd className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 border border-white/10 text-amber-300">
                  ⌘K
                </kbd>
              </button>

              {/* Couture Budget Calculator Button */}
              <button
                type="button"
                onClick={openBudgetModal}
                className="p-2 rounded-full text-zinc-400 hover:text-amber-300 hover:bg-white/5 transition-all cursor-pointer"
                title="Couture Casting Budget Estimator"
              >
                <Calculator size={17} />
              </button>

              {/* Couture Audio FX Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  soundOn
                    ? 'text-amber-400 hover:bg-amber-400/10'
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
                title={
                  soundOn
                    ? 'Haute Couture Audio Active (Click to mute)'
                    : 'Audio Muted (Click to enable)'
                }
              >
                {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
              </button>

              {/* Light / Dark Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-full text-zinc-400 hover:text-amber-300 hover:bg-white/5 transition-all cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4 pl-2 border-l border-white/10">
                  <Link
                    to="/notifications"
                    className="text-zinc-400 hover:text-amber-300 relative p-2 rounded-full hover:bg-white/5 transition-all"
                    title="Notifications"
                  >
                    <Bell size={18} aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-zinc-950 shadow-sm animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all"
                    >
                      Admin Console
                    </Link>
                  )}

                  <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[10px] font-mono font-bold tracking-widest px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">
                          {roleLabels[user?.role] || 'USER'}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 max-w-[140px] truncate block font-sans">
                        {user?.email}
                      </span>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="px-3.5 py-1.5 border border-white/20 text-xs font-mono tracking-wider uppercase rounded-full text-zinc-300 hover:text-white hover:border-white hover:bg-white/5 transition-all cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-gold !py-2 !px-4 !text-xs">
                    <span>Join Network</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle — shown up to the same `lg` breakpoint
                the full desktop nav (links + search + icon controls + auth
                buttons) needs to avoid overflowing; the old sm/md-based mix
                of breakpoints here left a broken tablet-width gap where the
                desktop nav showed without enough room (Join Network was
                pushed off-screen) while the hamburger had already hidden
                itself. */}
            <div className="flex items-center gap-1 lg:hidden">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-3 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                className="p-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="lg:hidden glass-dark border-t border-white/10 px-4 pt-4 pb-6 space-y-3">
            {isAuthenticated ? (
              <>
                <NavLinks user={user} mobile onNavigate={() => setMobileOpen(false)} />
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <Link
                    to="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-xs font-mono uppercase text-zinc-400 hover:text-amber-300 py-3 pr-3"
                  >
                    <Bell size={16} />
                    <span>Notifications ({unreadCount})</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-mono text-rose-400 uppercase tracking-wider cursor-pointer py-3 pl-3"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full py-2.5 text-center text-xs font-mono uppercase tracking-wider text-zinc-300 bg-white/5 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full py-2.5 text-center text-xs font-mono uppercase tracking-wider bg-amber-400 text-zinc-950 font-bold rounded-lg"
                >
                  Join Network
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Floating Real-Time Live Activity Toast */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed top-24 right-4 sm:right-8 z-50 glass-dark border border-[#d4af37]/60 rounded-2xl p-4 shadow-[0_15px_50px_rgba(212,175,55,0.25)] max-w-sm w-full flex items-start gap-3 backdrop-blur-2xl"
          >
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Sparkles size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-bold">
                  Live Dispatch Alert
                </span>
                <button
                  onClick={() => setActiveToast(null)}
                  className="text-zinc-500 hover:text-white p-2 -m-2 cursor-pointer"
                  title="Dismiss alert"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-white mt-1 line-clamp-2 leading-relaxed font-normal">
                {activeToast.message}
              </p>
              {activeToast.link && (
                <Link
                  to={activeToast.link}
                  onClick={() => setActiveToast(null)}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-mono text-[#d4af37] hover:text-[#f5e7ba] font-medium"
                >
                  Inspect details <ArrowRight size={12} />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
