import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Eye, EyeOff, Sparkles, Briefcase, Crown } from 'lucide-react';
import useAuthStore from '../store/authStore';
import AuthLayout from '../components/AuthLayout';

const ROLES = [
  {
    value: 'model',
    label: 'Model / Talent',
    desc: 'Build your portfolio & get discovered',
    icon: Sparkles,
  },
  {
    value: 'industry_professional',
    label: 'Industry Professional',
    desc: 'Brand, Agency, Director, Photographer',
    icon: Briefcase,
  },
  {
    value: 'pageant_organizer',
    label: 'Pageant Organizer',
    desc: 'Manage events & discover talent',
    icon: Crown,
  },
];

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Must match the backend's User.role enum and every role check across the
  // app ('model' | 'industry_professional' | 'pageant_organizer' | 'admin')
  const [role, setRole] = useState('model');
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(email, password, role);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout
      eyebrow="Join the network"
      title="Get discovered, or discover talent."
      tagline="Create a profile, build a portfolio, and start applying — or start casting."
    >
      <div className="w-full bg-[#121316]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/[0.06] ring-1 ring-white/[0.03]">
        <div className="flex items-center justify-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
            <UserPlus size={18} className="text-[#d4af37]" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Join the Network</h2>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl mb-6 text-sm"
            role="alert"
          >
            {error}
          </motion.div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Role Selector Cards */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              I am a…
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isActive = role === r.value;
                return (
                  <motion.button
                    key={r.value}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole(r.value)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-[#d4af37]/10 border-[#d4af37]/40 ring-1 ring-[#d4af37]/20'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-white/5 text-zinc-500'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${isActive ? 'text-[#d4af37]' : 'text-zinc-300'}`}
                      >
                        {r.label}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">{r.desc}</p>
                    </div>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-[#d4af37] shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2"
            >
              Email Address
            </label>
            <input
              id="register-email"
              type="email"
              required
              className="w-full p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37]/30 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                pattern="(?=.*[A-Za-z])(?=.*\d).+"
                title="At least 8 characters, including a letter and a number"
                className="w-full p-3 pr-11 bg-white/[0.04] border border-white/[0.08] rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37]/30 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, letter + number"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      password.length >= level * 3
                        ? level <= 2
                          ? 'bg-rose-400'
                          : level === 3
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        : 'bg-white/[0.06]'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8962e] hover:from-[#e5c349] hover:to-[#d4af37] text-black font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#d4af37]/10"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Creating Account…
              </span>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>

        <div className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#d4af37] hover:text-[#e5c349] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
