import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, CheckCheck, Sparkles, BellOff, ArrowRight, Clock } from 'lucide-react';
import api from '../api/axiosConfig';

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 rounded-2xl glass-dark border border-white/5 animate-pulse" />
      ))}
    </div>
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/me');
        setNotifications(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#d4af37] font-semibold flex items-center gap-2">
            <Sparkles size={13} className="text-[#d4af37]" />
            Activity Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mt-1">
            Notifications
          </h1>
          {unreadCount > 0 ? (
            <p className="text-xs font-mono text-[#d4af37] mt-1">
              You have {unreadCount} unread {unreadCount === 1 ? 'dispatch' : 'dispatches'}
            </p>
          ) : (
            <p className="text-xs text-zinc-400 mt-1">All caught up with your casting alerts</p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="self-start sm:self-auto text-xs text-[#d4af37] hover:text-[#f5e7ba] font-medium inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 hover:bg-[#d4af37]/20 transition-all cursor-pointer"
          >
            <CheckCheck size={14} aria-hidden="true" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <NotificationSkeleton />
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-20 text-center glass-dark rounded-2xl border border-white/10 p-8"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mb-4">
            <BellOff size={28} aria-hidden="true" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">Silence is Golden</h3>
          <p className="text-zinc-400 text-sm max-w-sm">
            You don't have any notifications at the moment. When castings, applications, or messages
            trigger updates, they'll appear here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((n, i) => {
              const Icon = n.type === 'system_alert' ? Sparkles : BellRing;
              return (
                <motion.div
                  key={n._id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i, 8) * 0.04 }}
                  className={`p-4 rounded-2xl flex gap-4 items-start transition-all duration-300 ${
                    !n.read
                      ? 'glass-dark border border-[#d4af37]/40 bg-[#d4af37]/[0.03] shadow-[0_0_20px_rgba(212,175,55,0.06)]'
                      : 'glass-dark border border-white/5 hover:border-white/10'
                  }`}
                >
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
                      !n.read
                        ? 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30'
                        : 'bg-white/5 text-zinc-500 border-white/10'
                    }`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-relaxed ${!n.read ? 'text-white font-medium' : 'text-zinc-300'}`}
                    >
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] font-mono text-zinc-500 inline-flex items-center gap-1">
                        <Clock size={11} />{' '}
                        {new Date(n.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {n.link && (
                        <Link
                          to={n.link}
                          className="text-xs text-[#d4af37] hover:text-[#f5e7ba] hover:underline font-medium inline-flex items-center gap-1"
                        >
                          View Details <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="shrink-0 text-zinc-500 hover:text-[#d4af37] transition-colors p-2.5 -m-1 rounded-lg hover:bg-white/5 cursor-pointer"
                      title="Mark as read"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
