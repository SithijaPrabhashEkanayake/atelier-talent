import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserCog,
  Images,
  ClipboardList,
  PlusCircle,
  Search,
  ShieldCheck,
  ArrowRight,
  BadgeCheck,
  Sparkles,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axiosConfig';

const ROLE_LABEL = {
  model: 'Accredited Model',
  industry_professional: 'Industry Casting Director',
  pageant_organizer: 'Pageant Organization Host',
  admin: 'Platform Administrator',
};

const actionsFor = (role) => {
  const common = [
    {
      to: '/profile/edit',
      label: 'Curate Profile',
      desc: 'Update personal measurements, biography & credentials',
      icon: UserCog,
    },
  ];

  if (role === 'model') {
    return [
      ...common,
      {
        to: '/portfolio',
        label: 'Manage Portfolio',
        desc: 'Upload composite cards, runway tapes & photos',
        icon: Images,
      },
      {
        to: '/applications',
        label: 'My Submissions',
        desc: 'Track casting reviews and shortlist progress',
        icon: ClipboardList,
      },
      {
        to: '/castings',
        label: 'Casting Board',
        desc: 'Browse open runway and commercial casting calls',
        icon: Search,
      },
    ];
  }
  if (role === 'industry_professional' || role === 'pageant_organizer') {
    return [
      ...common,
      {
        to: '/castings/create',
        label: 'Post Casting Call',
        desc: 'Publish targeted calls with demographic criteria',
        icon: PlusCircle,
      },
      {
        to: '/search',
        label: 'Talent Directory',
        desc: 'Scout verified models across 48+ countries',
        icon: Search,
      },
      {
        to: '/castings',
        label: 'Production Board',
        desc: 'Review active and past casting notices',
        icon: ClipboardList,
      },
    ];
  }
  if (role === 'admin') {
    return [
      ...common,
      {
        to: '/admin',
        label: 'Admin Command Center',
        desc: 'Moderate members, incident reports & castings',
        icon: ShieldCheck,
      },
    ];
  }
  return common;
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (user?.role !== 'model') return;
    api
      .get('/profiles/me')
      .then((res) => {
        if (res.data.data?._id) {
          return api.get(`/portfolio/${res.data.data._id}`);
        }
      })
      .then((res) => setAvatarUrl(res?.data?.data?.[0]?.thumbnailUrl || null))
      .catch(() => {});
  }, [user?.role]);

  const actions = actionsFor(user?.role);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Studio Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-dark border border-white/10 p-8 sm:p-10 mb-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 rounded-2xl bg-zinc-900 border-2 border-amber-400/40 flex items-center justify-center overflow-hidden shrink-0 shadow-lg"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-display font-bold text-amber-300">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </motion.div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-mono uppercase tracking-widest mb-2">
              <Sparkles size={11} /> Studio Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Welcome,</span>
              <span className="gold-gradient-text italic font-serif font-normal">
                {user?.email}
              </span>
              {user?.role === 'admin' && <BadgeCheck size={24} className="text-amber-400" />}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                {ROLE_LABEL[user?.role] || user?.role}
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Session
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Studio Workflows & Actions
          </h2>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
            {actions.length} Modules Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map(({ to, label, desc, icon: Icon }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={to}
                className="glass-dark rounded-2xl p-6 border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between h-[170px] shadow-xl group cursor-pointer block"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-400/20 transition-colors">
                    <Icon size={20} />
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
                  />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors">
                    {label}
                  </h3>
                  <p className="text-xs text-zinc-400 font-light mt-1 line-clamp-2">{desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
