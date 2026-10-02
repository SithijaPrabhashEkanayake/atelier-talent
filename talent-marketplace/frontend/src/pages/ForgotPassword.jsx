import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, CheckCircle2, Mail } from 'lucide-react';
import api from '../api/axiosConfig';
import AuthLayout from '../components/AuthLayout';

// Client-side must not reveal whether an account exists either — the
// backend always returns the same generic 200 message regardless of
// whether the email matches a real account (see
// backend/controllers/authController.js forgotPassword), so this page
// always shows that same generic message on a successful request and never
// branches its copy based on the response body.
const GENERIC_SUCCESS_MESSAGE =
  "If an account with that email exists, we've sent a link to reset your password.";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('success');
    } catch (err) {
      // Even a network/server error shouldn't be worded in a way that hints
      // at account existence — this is a generic failure message only.
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Locked out happens to everyone."
      tagline="We'll send a reset link — your profile and portfolio will be right where you left them."
    >
      <div className="w-full bg-[#121316]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/[0.06] ring-1 ring-white/[0.03]">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
            <KeyRound size={18} className="text-[#d4af37]" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Forgot Password</h2>
        </div>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <p className="text-emerald-400 text-sm leading-relaxed mb-2 font-medium">
              {GENERIC_SUCCESS_MESSAGE}
            </p>
            <p className="text-zinc-500 text-xs">Check your inbox and spam folder.</p>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <Mail size={16} className="text-zinc-500 shrink-0" />
              <p className="text-sm text-zinc-400">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {status === 'error' && (
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
                  htmlFor="forgot-password-email"
                  className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2"
                >
                  Email Address
                </label>
                <input
                  id="forgot-password-email"
                  type="email"
                  required
                  className="w-full p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37]/30 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <motion.button
                type="submit"
                disabled={status === 'loading'}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8962e] hover:from-[#e5c349] hover:to-[#d4af37] text-black font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#d4af37]/10"
              >
                {status === 'loading' ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Sending…
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </motion.button>
            </form>
          </>
        )}

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

export default ForgotPassword;
