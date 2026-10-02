import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserCog,
  Globe2,
  Ruler,
  Briefcase,
  Sparkles,
  Check,
  AlertCircle,
  Save,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axiosConfig';

const inputCls =
  'mt-1.5 block w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 shadow-sm p-3 text-sm focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all';
const labelCls = 'block text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium';

const ROLE_META = {
  model: { icon: Ruler, label: 'Model Portfolio & Measurements' },
  industry_professional: { icon: Briefcase, label: 'Industry & Production Profile' },
  pageant_organizer: { icon: Globe2, label: 'Pageant Federation & Organization Profile' },
};

export default function ProfileEditor() {
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState({});
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profiles/me');
        if (response.data.data) {
          setProfileData(response.data.data);
          if (user?.role === 'model') {
            api
              .get(`/portfolio/${response.data.data._id}`)
              .then((res) => setAvatarUrl(res.data.data[0]?.thumbnailUrl || null))
              .catch(() => {});
          }
        }
      } catch {
        // 404 indicates user hasn't created a profile yet
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await api.put('/profiles/me', profileData);
      setProfileData(response.data.data);
      setMessage({ text: 'Profile specifications updated successfully!', type: 'success' });
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Error updating profile specifications.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-8 animate-pulse">
        <div className="h-28 rounded-t-2xl glass-dark border border-white/5" />
        <div className="glass-dark rounded-b-2xl border border-white/5 p-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const roleMeta = ROLE_META[user?.role] || { icon: UserCog, label: 'Talent Profile' };
  const RoleIcon = roleMeta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto p-6 mt-6"
    >
      {/* Header Banner */}
      <div className="rounded-t-2xl glass-dark border-x border-t border-white/10 p-6 sm:p-8 flex items-center gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="w-16 h-16 rounded-full bg-black/40 border-2 border-[#d4af37]/60 shadow-[0_0_15px_rgba(212,175,55,0.25)] flex items-center justify-center overflow-hidden shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <RoleIcon size={26} className="text-[#d4af37]" />
          )}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">Edit Profile</h2>
            <Sparkles size={16} className="text-[#d4af37]" />
          </div>
          <p className="text-[#d4af37]/80 text-xs font-mono uppercase tracking-wider mt-1">
            {roleMeta.label}
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="glass-dark rounded-b-2xl border-x border-b border-white/10 p-6 sm:p-8 shadow-2xl">
        {message.text && (
          <div
            role="status"
            className={`p-4 mb-6 rounded-xl text-sm flex items-center gap-3 ${
              message.type === 'error'
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
            }`}
          >
            {message.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label htmlFor="profile-country" className={labelCls}>
                Country of Residence
              </label>
              <input
                id="profile-country"
                type="text"
                name="country"
                value={profileData.country || ''}
                onChange={handleChange}
                placeholder="e.g. France, United Kingdom, Sri Lanka"
                required
                className={inputCls}
              />
            </div>

            <div className="pb-1">
              <label
                htmlFor="profile-isPublished"
                className="flex items-center gap-3 cursor-pointer select-none bg-white/[0.02] border border-white/5 hover:border-white/15 p-3 rounded-xl transition-all"
              >
                <span
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
                  style={{ backgroundColor: profileData.isPublished ? '#d4af37' : '#27272a' }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-zinc-950 transition-transform ${
                      profileData.isPublished ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </span>
                <input
                  id="profile-isPublished"
                  type="checkbox"
                  name="isPublished"
                  checked={profileData.isPublished || false}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                  {profileData.isPublished ? 'Live on Marketplace' : 'Draft Mode (Hidden)'}
                </span>
              </label>
            </div>
          </div>

          {/* Model Fields */}
          {user?.role === 'model' && (
            <>
              <div className="border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="profile-fullName" className={labelCls}>
                    Full Professional Name
                  </label>
                  <input
                    id="profile-fullName"
                    type="text"
                    name="fullName"
                    value={profileData.fullName || ''}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="profile-category" className={labelCls}>
                    Primary Category
                  </label>
                  <select
                    id="profile-category"
                    name="category"
                    value={profileData.category || ''}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  >
                    <option value="" className="bg-zinc-900 text-zinc-400">
                      Select Category...
                    </option>
                    <option value="runway" className="bg-zinc-900 text-white">
                      Runway
                    </option>
                    <option value="commercial" className="bg-zinc-900 text-white">
                      Commercial
                    </option>
                    <option value="editorial" className="bg-zinc-900 text-white">
                      Editorial
                    </option>
                    <option value="pageant" className="bg-zinc-900 text-white">
                      Pageant
                    </option>
                  </select>
                </div>
                <div>
                  <label htmlFor="profile-dateOfBirth" className={labelCls}>
                    Date of Birth
                  </label>
                  <input
                    id="profile-dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : ''}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="profile-heightCm" className={labelCls}>
                    Height (cm)
                  </label>
                  <input
                    id="profile-heightCm"
                    type="number"
                    name="heightCm"
                    value={profileData.heightCm || ''}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Physical Specifications */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#d4af37] block mb-2">
                  Couture Measurements (cm)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="profile-bust" className={labelCls}>
                      Bust / Chest
                    </label>
                    <input
                      id="profile-bust"
                      type="number"
                      name="measurements.bust"
                      value={profileData.measurements?.bust || ''}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-waist" className={labelCls}>
                      Waist
                    </label>
                    <input
                      id="profile-waist"
                      type="number"
                      name="measurements.waist"
                      value={profileData.measurements?.waist || ''}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-hips" className={labelCls}>
                      Hips
                    </label>
                    <input
                      id="profile-hips"
                      type="number"
                      name="measurements.hips"
                      value={profileData.measurements?.hips || ''}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="profile-representationStatus" className={labelCls}>
                    Representation Status
                  </label>
                  <select
                    id="profile-representationStatus"
                    name="representationStatus"
                    value={profileData.representationStatus || 'freelance'}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  >
                    <option value="freelance" className="bg-zinc-900 text-white">
                      Freelance / Independent
                    </option>
                    <option value="agency_represented" className="bg-zinc-900 text-white">
                      Agency Represented
                    </option>
                  </select>
                </div>
                {profileData.representationStatus === 'agency_represented' && (
                  <div>
                    <label htmlFor="profile-agencyName" className={labelCls}>
                      Agency Name
                    </label>
                    <input
                      id="profile-agencyName"
                      type="text"
                      name="agencyName"
                      value={profileData.agencyName || ''}
                      onChange={handleChange}
                      placeholder="e.g. IMG Models, Elite"
                      className={inputCls}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Industry Professional Fields */}
          {user?.role === 'industry_professional' && (
            <div className="border-t border-white/5 pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="profile-industry-organizationName" className={labelCls}>
                    Organization / Studio Name
                  </label>
                  <input
                    id="profile-industry-organizationName"
                    type="text"
                    name="organizationName"
                    value={profileData.organizationName || ''}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="profile-organizationType" className={labelCls}>
                    Enterprise Type
                  </label>
                  <select
                    id="profile-organizationType"
                    name="organizationType"
                    value={profileData.organizationType || ''}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  >
                    <option value="" className="bg-zinc-900 text-zinc-400">
                      Select Type...
                    </option>
                    <option value="brand" className="bg-zinc-900 text-white">
                      Fashion Brand / House
                    </option>
                    <option value="director" className="bg-zinc-900 text-white">
                      Casting / Creative Director
                    </option>
                    <option value="agency" className="bg-zinc-900 text-white">
                      Talent / Model Agency
                    </option>
                    <option value="photographer" className="bg-zinc-900 text-white">
                      Production / Photography Studio
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="profile-description" className={labelCls}>
                  Editorial & Production Biography
                </label>
                <textarea
                  id="profile-description"
                  name="description"
                  value={profileData.description || ''}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe your creative work, notable campaigns, and casting preferences..."
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="profile-website" className={labelCls}>
                  Official Portfolio Website
                </label>
                <input
                  id="profile-website"
                  type="url"
                  name="website"
                  value={profileData.website || ''}
                  onChange={handleChange}
                  placeholder="https://yourbrand.com"
                  className={inputCls}
                />
              </div>
            </div>
          )}

          {/* Pageant Organizer Fields */}
          {user?.role === 'pageant_organizer' && (
            <div className="border-t border-white/5 pt-6 space-y-6">
              <div>
                <label htmlFor="profile-pageant-organizationName" className={labelCls}>
                  Pageant Organization Name
                </label>
                <input
                  id="profile-pageant-organizationName"
                  type="text"
                  name="organizationName"
                  value={profileData.organizationName || ''}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="profile-officialStatus" className={labelCls}>
                  Franchise & Accreditation Status
                </label>
                <input
                  id="profile-officialStatus"
                  type="text"
                  name="officialStatus"
                  value={profileData.officialStatus || ''}
                  onChange={handleChange}
                  placeholder="e.g. National Franchise Holder, Licensed Producer"
                  className={inputCls}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={saving}
              className="btn-gold px-7 py-3 rounded-xl flex items-center gap-2 font-medium text-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save size={16} />
              {saving ? 'Publishing Changes...' : 'Save Profile Specs'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
