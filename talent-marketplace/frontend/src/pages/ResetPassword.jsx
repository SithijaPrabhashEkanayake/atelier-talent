import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import api from '../api/axiosConfig';
import AuthLayout from '../components/AuthLayout';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      // Same generic wording the backend uses for an invalid/expired token —
      // don't hint at which case applied. On success, hand off to Login with
      // a message so the user knows to sign in with the new password.
      navigate('/login', {
        state: { message: 'Your password has been reset. Please sign in with your new password.' },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to reset password. The link may be invalid or expired.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Almost there"
      title="Choose a new password."
      tagline="Make it something only you would know — and different from the last one."
    >
      <div className="w-full bg-[#121316]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/[0.06] ring-1 ring-white/[0.03]">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
            <ShieldCheck size={18} className="text-[#d4af37]" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Reset Password</h2>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="reset-password-new"
              className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="reset-password-new"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                pattern="(?=.*[A-Za-z])(?=.*\d).+"
                title="At least 8 characters, including a letter and a number"
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

          <div>
            <label
              htmlFor="reset-password-confirm"
              className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2"
            >
              Confirm New Password
            </label>
            <input
              id="reset-password-confirm"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              className={`w-full p-3 bg-white/[0.04] border rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:ring-2 outline-none transition-all ${
                passwordsMatch
                  ? 'border-emerald-500/30 focus:ring-emerald-400/40'
                  : passwordsMismatch
                    ? 'border-rose-500/30 focus:ring-rose-400/40'
                    : 'border-white/[0.08] focus:ring-[#d4af37]/40 focus:border-[#d4af37]/30'
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
            {passwordsMatch && (
              <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                <ShieldCheck size={12} /> Passwords match
              </p>
            )}
            {passwordsMismatch && (
              <p className="text-xs text-rose-400 mt-1.5">Passwords do not match</p>
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
                Resetting…
              </span>
            ) : (
              'Reset Password'
            )}
          </motion.button>
        </form>

        <div className="text-center text-sm text-zinc-500 mt-6">
          Remembered your password?{' '}
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

export default ResetPassword;
