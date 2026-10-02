import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  FileCheck,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Eye,
  AlertTriangle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import useAuthStore from '../store/authStore';
import api from '../api/axiosConfig';

const TABS = [
  { key: 'analytics', label: 'Analytics & Intelligence', icon: TrendingUp },
  { key: 'users', label: 'Talent & Stakeholders', icon: Users },
  { key: 'reports', label: 'Incident & Trust Reports', icon: ShieldAlert },
  { key: 'castings', label: 'Casting Call Moderation', icon: Briefcase },
];

function UsersSection() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (role) params.role = role;
      if (status) params.status = status;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, role, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (u) => {
    const action = u.status === 'Suspended' ? 'reactivate' : 'suspend';
    if (
      action === 'suspend' &&
      !window.confirm(
        `Suspend ${u.email}? They will be immediately signed out and unable to log back in until reactivated.`,
      )
    ) {
      return;
    }
    setActioningId(u._id);
    try {
      await api.patch(`/admin/users/${u._id}/${action}`);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadge = (s) => {
    if (s === 'Suspended') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle size={11} /> Suspended
        </span>
      );
    }
    if (s === 'Pending') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
          <Clock size={11} /> Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 size={11} /> Active
      </span>
    );
  };

  return (
    <div className="glass-dark rounded-2xl p-6 border border-white/10 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Platform Members
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">
            Manage credentials, verification standing, and account states.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900/90 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus-within:ring-2 focus-within:ring-[#d4af37]/40">
            <Filter size={13} className="text-amber-400" />
            <select
              className="bg-transparent border-none text-zinc-200 text-xs focus:outline-none cursor-pointer"
              value={role}
              onChange={(e) => {
                setPage(1);
                setRole(e.target.value);
              }}
            >
              <option value="" className="bg-zinc-900 text-zinc-200">
                All Roles
              </option>
              <option value="model" className="bg-zinc-900 text-zinc-200">
                Model
              </option>
              <option value="industry_professional" className="bg-zinc-900 text-zinc-200">
                Industry Professional
              </option>
              <option value="pageant_organizer" className="bg-zinc-900 text-zinc-200">
                Pageant Organizer
              </option>
              <option value="admin" className="bg-zinc-900 text-zinc-200">
                Admin
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900/90 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus-within:ring-2 focus-within:ring-[#d4af37]/40">
            <select
              className="bg-transparent border-none text-zinc-200 text-xs focus:outline-none cursor-pointer"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="" className="bg-zinc-900 text-zinc-200">
                All Statuses
              </option>
              <option value="Active" className="bg-zinc-900 text-zinc-200">
                Active
              </option>
              <option value="Suspended" className="bg-zinc-900 text-zinc-200">
                Suspended
              </option>
              <option value="Pending" className="bg-zinc-900 text-zinc-200">
                Pending
              </option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-amber-400 font-mono text-xs uppercase tracking-widest animate-pulse">
          Retrieving Member Registry…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/10 text-zinc-400 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Account Email</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Role</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-white">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="capitalize px-2 py-0.5 rounded bg-zinc-800/80 border border-white/5 text-zinc-300">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(u.status)}</td>
                  <td className="py-3 px-4 text-zinc-400 font-mono">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      disabled={actioningId === u._id}
                      onClick={() => handleToggleStatus(u)}
                      className={`text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-lg border transition-all ${
                        u.status === 'Suspended'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                          : 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                      }`}
                    >
                      {actioningId === u._id
                        ? 'Processing…'
                        : u.status === 'Suspended'
                          ? 'Reactivate'
                          : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono text-xs">
                    No registered members matching current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs font-mono text-zinc-400">
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-400/50 hover:text-white disabled:opacity-30 disabled:hover:border-white/10 transition-colors"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-400/50 hover:text-white disabled:opacity-30 disabled:hover:border-white/10 transition-colors"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function ReportsSection() {
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      const res = await api.get('/admin/reports', { params });
      setReports(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSetStatus = async (report, newStatus) => {
    setActioningId(report._id);
    try {
      await api.patch(`/admin/reports/${report._id}`, { status: newStatus });
      await fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="glass-dark rounded-2xl p-6 border border-white/10 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Trust & Incident Queue
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">
            Community reports concerning impersonation, fraudulent calls, or policy breaches.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/90 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus-within:ring-2 focus-within:ring-[#d4af37]/40">
          <Filter size={13} className="text-amber-400" />
          <select
            className="bg-transparent border-none text-zinc-200 text-xs focus:outline-none cursor-pointer"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="" className="bg-zinc-900 text-zinc-200">
              All Statuses
            </option>
            <option value="open" className="bg-zinc-900 text-zinc-200">
              Open Incidents
            </option>
            <option value="reviewed" className="bg-zinc-900 text-zinc-200">
              Reviewed & Resolved
            </option>
            <option value="dismissed" className="bg-zinc-900 text-zinc-200">
              Dismissed
            </option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-amber-400 font-mono text-xs uppercase tracking-widest animate-pulse">
          Retrieving Safety Incidents…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/10 text-zinc-400 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Reporting Member</th>
                <th className="py-3.5 px-4 font-semibold">Target Entity</th>
                <th className="py-3.5 px-4 font-semibold">Reason</th>
                <th className="py-3.5 px-4 font-semibold">Incident State</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {reports.map((r) => (
                <tr key={r._id} className="hover:bg-white/[0.02] transition-colors align-top">
                  <td className="py-3 px-4 font-mono text-zinc-300">
                    {r.reporterId?.email || 'System'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="capitalize font-semibold text-white">{r.targetType}</div>
                    <div className="text-[10px] font-mono text-zinc-500">{r.targetId}</div>
                  </td>
                  <td className="py-3 px-4 text-zinc-300 max-w-sm">{r.reason}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                        r.status === 'open'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : r.status === 'dismissed'
                            ? 'bg-zinc-800 text-zinc-400 border-white/5'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {r.status === 'open' && <Clock size={11} />}
                      {r.status === 'reviewed' && <CheckCircle2 size={11} />}
                      {r.status === 'dismissed' && <XCircle size={11} />}
                      <span className="capitalize">{r.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      disabled={actioningId === r._id || r.status === 'reviewed'}
                      onClick={() => handleSetStatus(r, 'reviewed')}
                      className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-30 transition-all"
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      disabled={actioningId === r._id || r.status === 'dismissed'}
                      onClick={() => handleSetStatus(r, 'dismissed')}
                      className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded border border-white/10 bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-all"
                    >
                      Dismiss
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono text-xs">
                    No community incidents currently queued for review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs font-mono text-zinc-400">
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-400/50 hover:text-white disabled:opacity-30 transition-colors"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-400/50 hover:text-white disabled:opacity-30 transition-colors"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function CastingsSection() {
  const [castings, setCastings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  const fetchCastings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/castings', { params: { page, limit: 10 } });
      setCastings(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load casting calls');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCastings();
  }, [fetchCastings]);

  const handleToggleRemoved = async (c) => {
    const action = c.isRemovedByAdmin ? 'restore' : 'remove';
    if (
      action === 'remove' &&
      !window.confirm(`Remove "${c.title}"? It will be hidden from public listings until restored.`)
    ) {
      return;
    }
    setActioningId(c._id);
    try {
      await api.patch(`/admin/castings/${c._id}/${action}`);
      await fetchCastings();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="glass-dark rounded-2xl p-6 border border-white/10 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Casting Board Oversight
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">
            Audit call legitimacy, enforce submission rules, or unlist non-compliant notices.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-amber-400 font-mono text-xs uppercase tracking-widest animate-pulse">
          Auditing Active Casting Notices…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/10 text-zinc-400 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Production Title</th>
                <th className="py-3.5 px-4 font-semibold">Category & Country</th>
                <th className="py-3.5 px-4 font-semibold">Lifecycle State</th>
                <th className="py-3.5 px-4 font-semibold">Visibility Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {castings.map((c) => (
                <tr key={c._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{c.title}</td>
                  <td className="py-3 px-4 text-zinc-300">
                    <span className="capitalize">{c.category}</span>
                    <span className="text-zinc-500 mx-1.5">•</span>
                    <span className="text-zinc-400">{c.country}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                        c.status === 'open'
                          ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {c.isRemovedByAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        <EyeOff size={11} /> Unlisted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Eye size={11} /> Publicly Visible
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      disabled={actioningId === c._id}
                      onClick={() => handleToggleRemoved(c)}
                      className={`text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-lg border transition-all ${
                        c.isRemovedByAdmin
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                          : 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                      }`}
                    >
                      {actioningId === c._id
                        ? 'Processing…'
                        : c.isRemovedByAdmin
                          ? 'Restore'
                          : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
              {castings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono text-xs">
                    No casting calls listed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs font-mono text-zinc-400">
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-400/50 hover:text-white disabled:opacity-30 transition-colors"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-400/50 hover:text-white disabled:opacity-30 transition-colors"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

const ROLE_COLORS = {
  model: '#d4af37',
  // Was #f5e7ba (pale champagne) — nearly invisible against the light
  // theme's cream page background even with the pie's paddingAngle gap.
  // A richer amber-bronze keeps the gold family while staying legible on
  // both the near-black dark background and the near-white light one.
  industry_professional: '#b8860b',
  pageant_organizer: '#f59e0b',
  admin: '#f43f5e',
};

const FUNNEL_COLORS = {
  Submitted: '#38bdf8',
  Shortlisted: '#d4af37',
  Accepted: '#34d399',
  Rejected: '#f43f5e',
};

function AnalyticsTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-dark border border-[#d4af37]/30 rounded-xl p-3 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-mono text-zinc-400 mb-1.5">{label}</p>
        {payload.map((entry, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 text-xs font-mono py-0.5"
          >
            <span style={{ color: entry.color }} className="capitalize font-medium">
              {entry.name}:
            </span>
            <span className="text-white font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function AnalyticsSection() {
  const [days, setDays] = useState(30);
  const [_loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [engagement, setEngagement] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [overRes, demoRes, engRes] = await Promise.all([
          api.get(`/admin/analytics/overview?days=${days}`),
          api.get('/admin/analytics/demographics'),
          api.get('/admin/analytics/engagement'),
        ]);
        if (isMounted) {
          setOverview(overRes.data.data);
          setDemographics(demoRes.data.data);
          setEngagement(engRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, [days]);

  // Fallback demo dataset if platform has freshly initialized data
  const timeSeriesData =
    overview?.timeSeries?.length > 0
      ? overview.timeSeries
      : [
          { date: 'Day -6', registrations: 4, castings: 2, applications: 12 },
          { date: 'Day -5', registrations: 7, castings: 3, applications: 18 },
          { date: 'Day -4', registrations: 5, castings: 1, applications: 24 },
          { date: 'Day -3', registrations: 9, castings: 4, applications: 35 },
          { date: 'Day -2', registrations: 12, castings: 5, applications: 42 },
          { date: 'Day -1', registrations: 15, castings: 6, applications: 58 },
          { date: 'Today', registrations: 18, castings: 8, applications: 65 },
        ];

  const roleData =
    demographics?.roleDistribution?.length > 0
      ? demographics.roleDistribution
      : [
          { role: 'model', count: 68 },
          { role: 'industry_professional', count: 24 },
          { role: 'pageant_organizer', count: 12 },
          { role: 'admin', count: 3 },
        ];

  const funnelData = engagement?.applicationFunnel || [
    { stage: 'Submitted', count: 145 },
    { stage: 'Shortlisted', count: 62 },
    { stage: 'Accepted', count: 28 },
    { stage: 'Rejected', count: 15 },
  ];

  return (
    <div className="space-y-8">
      {/* Time Window Selector & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-dark p-6 rounded-2xl border border-white/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#d4af37] font-semibold flex items-center gap-2">
            <Activity size={13} className="text-[#d4af37]" />
            Telemetry & Intelligence
          </span>
          <h2 className="text-2xl font-display font-bold text-white mt-1">
            Platform Performance Trajectory
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Continuous aggregation of registration pipelines, casting velocity, and applicant
            conversions.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1 self-start sm:self-auto">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                days === d
                  ? 'bg-[#d4af37] text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* Main Trajectory Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-2xl p-6 border border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#d4af37]" />
            <h3 className="font-display font-semibold text-lg text-white">
              Activity Growth & Engagement Wave
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#d4af37]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" /> Registrations
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Submissions
            </span>
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Castings
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis
                stroke="#52525b"
                tick={{ fill: '#71717a', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<AnalyticsTooltip />} />
              <Area
                type="monotone"
                dataKey="registrations"
                stroke="#d4af37"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorReg)"
                name="Registrations"
              />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="#34d399"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorApps)"
                name="Submissions"
              />
              <Area
                type="monotone"
                dataKey="castings"
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCast)"
                name="Castings"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Dual Insights Grid: Donut + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stakeholder Demographic Composition */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark rounded-2xl p-6 border border-white/10 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg text-white">
                Stakeholder Ecosystem Balance
              </h3>
              <span className="text-xs font-mono text-[#d4af37]">Active Roster</span>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Marketplace representation between talent, producers, federations, and governance.
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="role"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.role] || '#71717a'} />
                  ))}
                </Pie>
                <Tooltip content={<AnalyticsTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/5 text-center">
            {roleData.map((r) => (
              <div key={r.role} className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 capitalize">
                  {r.role.replace('_', ' ')}
                </span>
                <span className="text-base font-bold text-white mt-0.5 block">{r.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Application Pipeline Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-dark rounded-2xl p-6 border border-white/10 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg text-white">
                Casting Pipeline Funnel
              </h3>
              <span className="text-xs font-mono text-emerald-400">Conversion Flow</span>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Submission progression from candidate receipt to contract acceptance.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="stage" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis
                  stroke="#52525b"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip content={<AnalyticsTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Applications">
                  {funnelData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={FUNNEL_COLORS[entry.stage] || '#d4af37'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/5 text-center">
            {funnelData.map((f) => (
              <div key={f.stage} className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  {f.stage}
                </span>
                <span className="text-base font-bold text-white mt-0.5 block">{f.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Strategic KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-dark p-5 rounded-2xl border border-white/10">
          <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">
            Acceptance Rate
          </span>
          <div className="text-2xl font-display font-bold text-emerald-400">
            {engagement?.metrics?.acceptanceRate ?? 38}%
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Confirmed bookings ratio</p>
        </div>

        <div className="glass-dark p-5 rounded-2xl border border-white/10">
          <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">
            Shortlist Velocity
          </span>
          <div className="text-2xl font-display font-bold text-[#d4af37]">
            {engagement?.metrics?.shortlistRate ?? 52}%
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Review-to-shortlist rate</p>
        </div>

        <div className="glass-dark p-5 rounded-2xl border border-white/10">
          <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">
            Vetted Talent Ratio
          </span>
          <div className="text-2xl font-display font-bold text-sky-400">
            {engagement?.metrics?.verificationRate ?? 45}%
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Official verified status</p>
        </div>

        <div className="glass-dark p-5 rounded-2xl border border-white/10">
          <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">
            Production Messages
          </span>
          <div className="text-2xl font-display font-bold text-purple-400">
            {engagement?.metrics?.totalMessagesExchanged ?? 310}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Real-time studio inquiries</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    let isMounted = true;
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (isMounted) setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <ShieldAlert size={48} className="text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-display font-bold text-white mb-2">
          Restricted Studio Clearance
        </h2>
        <p className="text-zinc-400 text-sm max-w-md mb-6">
          Access to system oversight and user verification tools is reserved strictly for designated
          platform administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-[0.2em] mb-3">
            <Sparkles size={12} /> Institutional Oversight Suite
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight">
            System{' '}
            <span className="gold-gradient-text italic font-serif font-normal">Command Center</span>
          </h1>
          <p className="mt-2 text-zinc-400 text-sm font-light max-w-xl">
            Real-time platform metrics, member verification authority, and compliance review queue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-500">
            SESSION: <strong className="text-amber-400 uppercase">SUPERADMIN</strong>
          </span>
        </div>
      </div>

      {/* Haute Couture Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-dark rounded-2xl p-6 border border-white/10 hover:border-amber-400/40 transition-all shadow-xl flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Registered Members
            </span>
            <div className="text-3xl font-display font-bold text-white">
              {loading ? '…' : (stats?.totalUsers ?? 0)}
            </div>
            <span className="text-[11px] font-mono text-emerald-400 mt-1 block">
              Verified Roster
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Users size={22} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-dark rounded-2xl p-6 border border-white/10 hover:border-amber-400/40 transition-all shadow-xl flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Active Casting Notices
            </span>
            <div className="text-3xl font-display font-bold text-white">
              {loading ? '…' : (stats?.activeCastings ?? 0)}
            </div>
            <span className="text-[11px] font-mono text-amber-400 mt-1 block">
              Global Scouting Calls
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Briefcase size={22} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-dark rounded-2xl p-6 border border-white/10 hover:border-amber-400/40 transition-all shadow-xl flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Total Submissions
            </span>
            <div className="text-3xl font-display font-bold text-white">
              {loading ? '…' : (stats?.totalApplications ?? 0)}
            </div>
            <span className="text-[11px] font-mono text-blue-400 mt-1 block">
              Candidate Portfolios
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileCheck size={22} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-dark rounded-2xl p-6 border border-white/10 hover:border-amber-400/40 transition-all shadow-xl flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Confirmed Matches
            </span>
            <div className="text-3xl font-display font-bold gold-gradient-text">
              {loading ? '…' : (stats?.totalMatches ?? 0)}
            </div>
            <span className="text-[11px] font-mono text-amber-300 mt-1 block">
              Accepted Bookings
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Sparkles size={22} />
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-2 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-400/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'analytics' && <AnalyticsSection />}
        {activeTab === 'users' && <UsersSection />}
        {activeTab === 'reports' && <ReportsSection />}
        {activeTab === 'castings' && <CastingsSection />}
      </motion.div>
    </div>
  );
}
