import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, FileText, ArrowLeft } from 'lucide-react';

const PAGES = {
  '/privacy': {
    icon: Lock,
    eyebrow: 'Data Handling',
    title: 'Privacy Policy',
    intro:
      'ATELIER Talent is an academic capstone project (BSc Software Engineering, NSBM Green University) built as a working prototype of a talent-marketplace platform. This page explains, plainly, what the demo application does with data — it is not a substitute for a commercial privacy policy.',
    sections: [
      {
        heading: 'What this demo collects',
        body: 'Account email, hashed password, the role-specific profile fields you enter (measurements, organization details, portfolio media, etc.), and application/casting activity needed for the platform to function. Portfolio images and video are stored via Cloudinary.',
      },
      {
        heading: 'What it does not do',
        body: 'No data is sold, shared with advertisers, or used for anything beyond running the demo. There are no third-party trackers or analytics scripts on this site.',
      },
      {
        heading: 'Demo data',
        body: 'Seed/demo accounts on this deployment use placeholder names and stock photography — they do not represent real people.',
      },
    ],
  },
  '/terms': {
    icon: FileText,
    eyebrow: 'Usage Terms',
    title: 'Terms of Service',
    intro:
      'This software is provided as an academic prototype, for evaluation and demonstration purposes, "as is" and without warranty of any kind — it is not a commercially operated service.',
    sections: [
      {
        heading: 'Acceptable use',
        body: 'Use the demo environment for evaluation, testing, and academic review. Do not submit real personal, financial, or otherwise sensitive information into any field.',
      },
      {
        heading: 'No liability',
        body: 'As a student project, the platform makes no availability, accuracy, or data-retention guarantees. Demo data may be reset at any time.',
      },
      {
        heading: 'Intellectual property',
        body: 'Stock photography used in demo content belongs to its respective sources and is used here for illustrative purposes only.',
      },
    ],
  },
  '/security': {
    icon: ShieldCheck,
    eyebrow: 'Security & Data Protection',
    title: 'Security Overview',
    intro:
      "A summary of the security controls implemented in this system, drawn from the project's Security & Data Protection Policy (v2.0).",
    sections: [
      {
        heading: 'Authentication',
        body: 'Passwords are hashed with bcrypt (never stored or logged in plaintext) and excluded from query results by default. Access is via short-lived JWTs; refresh tokens are stored in httpOnly, rotating cookies rather than browser storage.',
      },
      {
        heading: 'Authorization',
        body: 'Every role (Model, Industry Professional, Pageant Organizer, Admin) is granted only the permissions its function requires, enforced server-side on every request — the frontend never acts as a security boundary.',
      },
      {
        heading: 'Abuse mitigation',
        body: 'Rate limiting is applied to authentication and general API traffic, with a dedicated tighter limit on password-reset requests to resist brute-force and enumeration attempts.',
      },
      {
        heading: 'Fail securely',
        body: 'On error or ambiguity, the system denies access and returns a generic message rather than defaulting to permissive behavior.',
      },
    ],
  },
};

export default function LegalPage() {
  const { pathname } = useLocation();
  const page = PAGES[pathname] || PAGES['/privacy'];
  const Icon = page.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-amber-400 transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        <span>Back Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-dark rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center shrink-0">
            <Icon size={20} className="text-[#d4af37]" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-[#d4af37]">
              {page.eyebrow}
            </p>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {page.title}
            </h1>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed mb-8 pb-8 border-b border-white/10">
          {page.intro}
        </p>

        <div className="space-y-6">
          {page.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-sm font-semibold text-white mb-1.5">{section.heading}</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
