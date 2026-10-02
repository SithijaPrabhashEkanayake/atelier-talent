import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  // ResetPassword redirects here with a success message in router state
  // (e.g. after a completed password reset) — surface it once, non-fatally.
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Your next casting call is one login away."
      tagline="Models, agencies, and pageant organizers already building their careers here."
    >
      <div className="w-full bg-[#121316]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/[0.06] ring-1 ring-white/[0.03]">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
            <LogIn size={18} className="text-[#d4af37]" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Welcome Back</h2>
        </div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl mb-6 text-sm"
            role="status"
          >
            {successMessage}
          </motion.div>
        )}
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              className="w-full p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37]/30 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#d4af37] hover:text-[#e5c349] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full p-3 pr-11 bg-white/[0.04] border border-white/[0.08] rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37]/30 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                Signing In…
              </span>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        <div className="text-center text-sm text-zinc-500 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#d4af37] hover:text-[#e5c349] transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
