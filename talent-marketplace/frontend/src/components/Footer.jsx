import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Award, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          {/* Brand Manifesto Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-1.5"
              >
                <span>ATELIER</span>
                <span className="text-amber-400 font-serif italic text-xs tracking-widest px-2 py-0.5 rounded border border-amber-400/30 bg-amber-400/10">
                  TALENT
                </span>
              </Link>
            </div>
            <p className="text-sm text-zinc-400 font-sans leading-relaxed max-w-sm">
              The premier global multidimensional talent marketplace and casting management system.
              Bridging the gap between freelance models, premier casting directors, and
              international pageant organizations through verified credentials and intelligent
              matching.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-amber-400" />
                <span>Verified Profiles</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe size={14} className="text-amber-400" />
                <span>Global Casting</span>
              </div>
              <div className="flex items-center gap-1">
                <Award size={14} className="text-amber-400" />
                <span>Zero Exploitation Policy</span>
              </div>
            </div>
          </div>

          {/* Column 2: Talent */}
          <div>
            <h4 className="text-xs font-mono font-semibold tracking-widest text-zinc-200 uppercase mb-4">
              Talent Roster
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/search" className="hover:text-amber-300 transition-colors">
                  Runway Models
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-amber-300 transition-colors">
                  Editorial Fashion
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-amber-300 transition-colors">
                  Commercial & Print
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-amber-300 transition-colors">
                  Pageant Titleholders
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-amber-300 transition-colors">
                  Build Your Comp-Card
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Casting & Agency */}
          <div>
            <h4 className="text-xs font-mono font-semibold tracking-widest text-zinc-200 uppercase mb-4">
              Casting Hub
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/castings" className="hover:text-amber-300 transition-colors">
                  Casting Call Board
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-amber-300 transition-colors">
                  Talent Scout Engine
                </Link>
              </li>
              <li>
                <Link to="/castings/create" className="hover:text-amber-300 transition-colors">
                  Post Casting Call
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-amber-300 transition-colors">
                  Application Pipeline
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-amber-300 transition-colors">
                  Agency Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Global Hubs & Academic Credentials */}
          <div>
            <h4 className="text-xs font-mono font-semibold tracking-widest text-zinc-200 uppercase mb-4">
              Global Centers
            </h4>
            <ul className="space-y-2 text-xs font-mono text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Paris · 8e
                Arrondissement
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Milan · Via
                Montenapoleone
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>New York · SoHo
                District
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>London · Mayfair W1
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Colombo · Green City
                Hub
              </li>
            </ul>
          </div>
        </div>

        {/* Academic & University Affiliation Badge */}
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span>
              Academic Final Project Research · <b>NSBM Green University</b> · Faculty of Computing
            </span>
          </div>
          <div className="font-mono text-zinc-400">
            Candidate: <b>Sandun Prabath</b> (ID: 28607) · BSc (Hons) Software Engineering
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>
            © {new Date().getFullYear()} ATELIER Global Talent Marketplace. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="hover:text-zinc-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-zinc-400 transition-colors">
              Terms of Service
            </Link>
            <Link to="/security" className="hover:text-zinc-400 transition-colors">
              Security & Data Protection
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
