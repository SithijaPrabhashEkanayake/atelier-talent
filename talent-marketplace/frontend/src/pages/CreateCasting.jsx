import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Megaphone, SlidersHorizontal, Calendar, MapPin, Tag, FileText } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axiosConfig';

const inputCls =
  'mt-1 block w-full rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-100 placeholder:text-zinc-600 p-3 focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37]/30 outline-none transition-all';
const labelCls = 'block text-xs font-semibold text-zinc-400 uppercase tracking-wider';

export default function CreateCasting() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    country: '',
    category: '',
    description: '',
    applicationDeadline: '',
    criteria: { minAge: '', maxAge: '', minHeightCm: '', maxHeightCm: '', experienceLevel: 'any' },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (user?.role === 'model')
    return <div className="p-8 text-center text-rose-400">Unauthorized</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('criteria.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({ ...prev, criteria: { ...prev.criteria, [field]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Clean empty numeric criteria
    const payload = { ...formData };
    ['minAge', 'maxAge', 'minHeightCm', 'maxHeightCm'].forEach((key) => {
      if (payload.criteria[key] === '') delete payload.criteria[key];
    });

    try {
      const res = await api.post('/castings', payload);
      navigate(`/castings/${res.data.data._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Error creating casting call. Have you completed your profile yet?',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto p-6 mt-8"
    >
      {/* Header */}
      <div className="rounded-t-2xl bg-gradient-to-r from-[#d4af37]/20 to-[#b8962e]/10 border border-b-0 border-[#d4af37]/20 p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center shrink-0">
          <Megaphone size={22} className="text-[#d4af37]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Post a Casting Call</h2>
          <p className="text-zinc-500 text-sm">Reach talent that matches exactly what you need.</p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#121316]/80 backdrop-blur-xl rounded-b-2xl border border-t-0 border-white/[0.06] shadow-2xl p-6 space-y-6"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm"
          >
            {error}
          </motion.div>
        )}

        <div>
          <label htmlFor="casting-title" className={labelCls}>
            <span className="inline-flex items-center gap-1.5">
              <FileText size={12} /> Title
            </span>
          </label>
          <input
            id="casting-title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputCls}
            placeholder="e.g. Spring/Summer Runway Show"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="casting-country" className={labelCls}>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} /> Country
              </span>
            </label>
            <input
              id="casting-country"
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className={inputCls}
              placeholder="e.g. Sri Lanka"
            />
          </div>
          <div>
            <label htmlFor="casting-category" className={labelCls}>
              <span className="inline-flex items-center gap-1.5">
                <Tag size={12} /> Category
              </span>
            </label>
            <select
              id="casting-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value="">Select…</option>
              <option value="runway">Runway</option>
              <option value="commercial">Commercial</option>
              <option value="editorial">Editorial</option>
              <option value="pageant">Pageant</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="casting-description" className={labelCls}>
            Description
          </label>
          <textarea
            id="casting-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="5"
            className={inputCls}
            placeholder="Describe the casting call, requirements, and expectations…"
          ></textarea>
        </div>

        <div>
          <label htmlFor="casting-applicationDeadline" className={labelCls}>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={12} /> Application Deadline
            </span>
          </label>
          <input
            id="casting-applicationDeadline"
            type="date"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            required
            className={inputCls}
          />
        </div>

        {/* Criteria Section */}
        <div className="border-t border-white/[0.06] pt-6">
          <h3 className="text-sm font-semibold mb-4 inline-flex items-center gap-2 text-zinc-300">
            <SlidersHorizontal size={16} className="text-[#d4af37]" aria-hidden="true" />
            Suitability Criteria
            <span className="text-zinc-600 font-normal text-xs">(optional)</span>
          </h3>
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="casting-minAge" className={labelCls}>
                Min Age
              </label>
              <input
                id="casting-minAge"
                type="number"
                name="criteria.minAge"
                value={formData.criteria.minAge}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. 18"
              />
            </div>
            <div>
              <label htmlFor="casting-maxAge" className={labelCls}>
                Max Age
              </label>
              <input
                id="casting-maxAge"
                type="number"
                name="criteria.maxAge"
                value={formData.criteria.maxAge}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. 30"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="casting-minHeightCm" className={labelCls}>
                Min Height (cm)
              </label>
              <input
                id="casting-minHeightCm"
                type="number"
                name="criteria.minHeightCm"
                value={formData.criteria.minHeightCm}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. 170"
              />
            </div>
            <div>
              <label htmlFor="casting-maxHeightCm" className={labelCls}>
                Max Height (cm)
              </label>
              <input
                id="casting-maxHeightCm"
                type="number"
                name="criteria.maxHeightCm"
                value={formData.criteria.maxHeightCm}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. 190"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8962e] hover:from-[#e5c349] hover:to-[#d4af37] text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#d4af37]/10"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Posting…
              </span>
            ) : (
              'Post Casting Call'
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
