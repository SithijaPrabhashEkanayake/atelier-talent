// Rich demo-data seeder — populates every collection with realistic,
// varied content so the app can actually be looked at and demoed instead
// of showing empty states everywhere. Unlike seed-dev.js (which makes two
// throwaway accounts with random passwords for quick auth testing), this
// creates a full connected dataset: models with portfolios, organizers with
// casting calls, applications in every status, messages, notifications,
// and a couple of admin reports/logs.
//
// Portfolio/profile images are hotlinked from picsum.photos (deterministic
// per-seed, so re-running produces the same visuals) rather than uploaded
// through Cloudinary — this is demo data, not real user content, and using
// the real Cloudinary account for throwaway seed images would burn real
// storage/bandwidth on the credentials that are already flagged for
// rotation. PortfolioItem.publicId is left null for these, which the
// delete-portfolio-item endpoint already treats as "nothing to clean up
// in Cloudinary" (see portfolioController.js).
//
// Run with: node scripts/seed-demo.js
// Refuses to run with NODE_ENV=production, same guard as seed-dev.js.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const ModelProfile = require('../models/ModelProfile');
const IndustryProfile = require('../models/IndustryProfile');
const PageantOrgProfile = require('../models/PageantOrgProfile');
const PAGEANT_NAMES = require('./pageant-names');
const PortfolioItem = require('../models/PortfolioItem');
const CastingCall = require('../models/CastingCall');
const Application = require('../models/Application');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const AdminActionLog = require('../models/AdminActionLog');

if (process.env.NODE_ENV === 'production') {
  console.error(
    'Refusing to run seed-demo.js with NODE_ENV=production. This script is for local/dev use only.',
  );
  process.exit(1);
}

const DEMO_EMAIL_SUFFIX = '@demo.talent';
const DEMO_PASSWORD = 'Password123'; // meets the 8+ char, letter+number policy

// i.pravatar.cc's `u=` hash picks a photo with zero regard for gender, so a
// name-derived seed could (and did — see the female names showing up with
// male stock photos in the live demo data) land on a mismatched photo.
// xsgames.co/randomusers is the underlying asset set pravatar itself draws
// from, but exposed here split into separate male/ and female/ folders
// (indices 0-78 each) — hash the seed into that range so the photo is still
// deterministic per-profile, but gender-correct.
function hashToIndex(str, mod) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}
const AVATAR_POOL_SIZE = 79;
const img = (isFemale, seed) =>
  `https://xsgames.co/randomusers/assets/avatars/${isFemale ? 'female' : 'male'}/${hashToIndex(seed, AVATAR_POOL_SIZE)}.jpg`;

const MODELS = [
  {
    fullName: 'Amara Silva',
    country: 'Sri Lanka',
    dob: '1999-03-14',
    height: 174,
    category: 'runway',
    rep: 'agency_represented',
    agency: 'Colombo Elite Models',
    skills: ['runway', 'editorial posing'],
    exp: 4,
    verified: true,
    seed: 'amara',
    isFemale: true,
  },
  {
    fullName: 'Ishara Perera',
    country: 'Sri Lanka',
    dob: '2001-07-22',
    height: 168,
    category: 'commercial',
    rep: 'freelance',
    skills: ['commercial print', 'lifestyle'],
    exp: 1,
    verified: false,
    seed: 'ishara',
    isFemale: true,
  },
  {
    fullName: 'Nadia Fernando',
    country: 'Sri Lanka',
    dob: '1997-11-02',
    height: 171,
    category: 'editorial',
    rep: 'agency_represented',
    agency: 'South Asia Talent Group',
    skills: ['editorial', 'high fashion'],
    exp: 6,
    verified: true,
    seed: 'nadia',
    isFemale: true,
  },
  {
    fullName: 'Priya Jayasuriya',
    country: 'India',
    dob: '2000-01-30',
    height: 170,
    category: 'pageant',
    rep: 'freelance',
    skills: ['pageant walk', 'public speaking'],
    exp: 2,
    verified: false,
    seed: 'priya',
    isFemale: true,
  },
  {
    fullName: 'Zara Khan',
    country: 'India',
    dob: '1998-05-18',
    height: 176,
    category: 'runway',
    rep: 'agency_represented',
    agency: 'Mumbai Faces',
    skills: ['runway', 'couture'],
    exp: 5,
    verified: true,
    seed: 'zara',
    isFemale: true,
  },
  {
    fullName: 'Liyana Rahman',
    country: 'Philippines',
    dob: '2002-09-09',
    height: 165,
    category: 'commercial',
    rep: 'freelance',
    skills: ['commercial print', 'beauty'],
    exp: 0,
    verified: false,
    seed: 'liyana',
    isFemale: true,
  },
  {
    fullName: 'Kavindu De Silva',
    country: 'Sri Lanka',
    dob: '1999-12-05',
    height: 183,
    category: 'editorial',
    rep: 'freelance',
    skills: ['editorial', 'menswear'],
    exp: 3,
    verified: false,
    seed: 'kavindu',
    isFemale: false,
  },
  {
    fullName: 'Sasha Wright',
    country: 'United Kingdom',
    dob: '1996-04-27',
    height: 178,
    category: 'runway',
    rep: 'agency_represented',
    agency: 'London Runway Collective',
    skills: ['runway', 'catwalk choreography'],
    exp: 7,
    verified: true,
    seed: 'sasha',
    isFemale: true,
  },
];

const ORGANIZERS = [
  {
    org: 'Serendib Fashion House',
    type: 'brand',
    country: 'Sri Lanka',
    desc: 'A contemporary fashion label blending traditional Sri Lankan textiles with modern silhouettes.',
    site: 'https://serendibfashion.example.com',
    verified: true,
    seed: 'serendib',
  },
  {
    org: 'Lens & Light Studio',
    type: 'photographer',
    country: 'Sri Lanka',
    desc: 'Editorial and commercial photography studio working with brands across South Asia.',
    site: 'https://lenslight.example.com',
    verified: false,
    seed: 'lenslight',
  },
  {
    org: 'Horizon Talent Agency',
    type: 'agency',
    country: 'India',
    desc: 'Full-service talent agency representing models and actors across South Asia.',
    site: 'https://horizontalent.example.com',
    verified: true,
    seed: 'horizon',
  },
  {
    org: 'Reel Motion Productions',
    type: 'director',
    country: 'Philippines',
    desc: 'Commercial and music-video production house.',
    site: 'https://reelmotion.example.com',
    verified: false,
    seed: 'reelmotion',
  },
];

const PAGEANTS = [
  {
    org: PAGEANT_NAMES[2],
    country: 'Sri Lanka',
    status: 'Sanctioned national pageant, est. 2010',
    seed: 'missuniverse',
  },
  {
    org: PAGEANT_NAMES[0],
    country: 'Sri Lanka',
    status: 'Regional pageant circuit covering 6 countries',
    seed: 'missgrand',
  },
];

const CASTINGS = [
  {
    title: 'Spring/Summer Runway Show',
    country: 'Sri Lanka',
    category: 'runway',
    desc: 'Seeking runway models for our flagship Spring/Summer collection show in Colombo. Full rehearsal + show day.',
    minAge: 18,
    maxAge: 28,
    minH: 170,
    maxH: 185,
    skills: ['runway'],
    days: 21,
  },
  {
    title: 'Editorial Shoot — "Monsoon" Series',
    country: 'Sri Lanka',
    category: 'editorial',
    desc: 'High-fashion editorial for a 12-page magazine spread themed around the monsoon season.',
    minAge: 20,
    maxAge: 35,
    minH: 165,
    maxH: 180,
    skills: ['editorial'],
    days: 14,
  },
  {
    title: 'Skincare Brand Commercial',
    country: 'India',
    category: 'commercial',
    desc: 'Lifestyle commercial shoot for a new skincare product line. Natural, approachable look.',
    minAge: 19,
    maxAge: 30,
    minH: 160,
    maxH: 178,
    skills: ['commercial print'],
    days: 10,
  },
  {
    title: `${PAGEANT_NAMES[2]} — Preliminary Round`,
    country: 'Sri Lanka',
    category: 'pageant',
    desc: 'Open call for preliminary round contestants. Evening wear + interview segment.',
    minAge: 18,
    maxAge: 26,
    minH: 165,
    maxH: 180,
    skills: [],
    days: 30,
  },
  {
    title: 'Menswear Editorial',
    country: 'Sri Lanka',
    category: 'editorial',
    desc: 'Menswear editorial for a regional lifestyle publication. Studio shoot, one day.',
    minAge: 22,
    maxAge: 40,
    minH: 178,
    maxH: 195,
    skills: ['menswear'],
    days: 18,
  },
  {
    title: 'Music Video Casting — Lead Extra',
    country: 'Philippines',
    category: 'commercial',
    desc: 'Featured background talent for an upcoming music video production.',
    minAge: 18,
    maxAge: 32,
    minH: 160,
    maxH: 180,
    skills: [],
    days: 7,
  },
  {
    title: 'Couture Runway — Winter Collection',
    country: 'United Kingdom',
    category: 'runway',
    desc: 'London Fashion Week adjacent showcase for an emerging couture designer.',
    minAge: 18,
    maxAge: 30,
    minH: 173,
    maxH: 188,
    skills: ['couture', 'runway'],
    days: 25,
  },
  {
    title: 'Beauty Campaign — Closed Call',
    country: 'Philippines',
    category: 'commercial',
    desc: 'Already cast — kept here to demonstrate a closed casting call.',
    minAge: 18,
    maxAge: 30,
    minH: 160,
    maxH: 178,
    skills: ['beauty'],
    days: -3,
    forceClose: true,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for demo seeding...');

    // --- Clean slate for demo accounts only ---
    const staleUsers = await User.find(
      { email: new RegExp(`${DEMO_EMAIL_SUFFIX.replace('.', '\\.')}$`) },
      '_id',
    );
    const staleIds = staleUsers.map((u) => u._id);
    const staleModelProfiles = await ModelProfile.find({ userId: { $in: staleIds } }, '_id');
    const staleModelProfileIds = staleModelProfiles.map((p) => p._id);
    await PortfolioItem.deleteMany({ modelProfileId: { $in: staleModelProfileIds } });
    const staleIndustryProfiles = await IndustryProfile.find({ userId: { $in: staleIds } }, '_id');
    const staleIndustryProfileIds = staleIndustryProfiles.map((p) => p._id);
    const staleCastings = await CastingCall.find(
      { creatorProfileId: { $in: staleIndustryProfileIds } },
      '_id',
    );
    const staleCastingIds = staleCastings.map((c) => c._id);
    const staleApplications = await Application.find(
      {
        $or: [
          { modelProfileId: { $in: staleModelProfileIds } },
          { castingCallId: { $in: staleCastingIds } },
        ],
      },
      '_id',
    );
    const staleApplicationIds = staleApplications.map((a) => a._id);
    await Message.deleteMany({ applicationId: { $in: staleApplicationIds } });
    await Application.deleteMany({ _id: { $in: staleApplicationIds } });
    await CastingCall.deleteMany({ _id: { $in: staleCastingIds } });
    await Notification.deleteMany({ userId: { $in: staleIds } });
    await Report.deleteMany({ reporterId: { $in: staleIds } });
    await AdminActionLog.deleteMany({ adminId: { $in: staleIds } });
    await ModelProfile.deleteMany({ userId: { $in: staleIds } });
    await IndustryProfile.deleteMany({ userId: { $in: staleIds } });
    await PageantOrgProfile.deleteMany({ userId: { $in: staleIds } });
    // Note: `staleUsers` was fetched with a '_id'-only projection above, so
    // its documents don't actually have `.email` populated — delete by the
    // same regex directly instead of collecting (undefined) emails from it.
    await User.deleteMany({ email: new RegExp(`${DEMO_EMAIL_SUFFIX.replace('.', '\\.')}$`) });

    // --- Admin ---
    const admin = await User.create({
      email: `admin${DEMO_EMAIL_SUFFIX}`,
      password: DEMO_PASSWORD,
      role: 'admin',
    });

    // --- Models ---
    const modelProfiles = [];
    for (let i = 0; i < MODELS.length; i++) {
      const m = MODELS[i];
      const user = await User.create({
        email: `model${i + 1}${DEMO_EMAIL_SUFFIX}`,
        password: DEMO_PASSWORD,
        role: 'model',
      });
      const profile = await ModelProfile.create({
        userId: user._id,
        fullName: m.fullName,
        country: m.country,
        dateOfBirth: m.dob,
        heightCm: m.height,
        measurements: { bust: 80 + (i % 5), waist: 60 + (i % 4), hips: 88 + (i % 5) },
        category: m.category,
        representationStatus: m.rep,
        agencyName: m.rep === 'agency_represented' ? m.agency : null,
        experience: Array.from({ length: m.exp }, (_, j) => ({
          title: ['Runway Show', 'Print Campaign', 'Editorial Shoot', 'Brand Ambassador'][j % 4],
          organization: ['Local Fashion Week', 'Regional Brand Co.', 'Studio Collective'][j % 3],
          year: 2020 + j,
          description: 'Featured talent for a seasonal campaign.',
        })),
        skills: m.skills,
        socialLinks: { instagram: `@${m.fullName.split(' ')[0].toLowerCase()}`, tiktok: '' },
        isPublished: true,
        isVerified: m.verified,
      });
      modelProfiles.push({ profile, meta: m });

      const itemCount = 2 + (i % 3);
      for (let k = 0; k < itemCount; k++) {
        await PortfolioItem.create({
          modelProfileId: profile._id,
          type: 'photo',
          category: [m.category, 'headshot', 'commercial'][k % 3],
          // Same seed for both — xsgames.co serves one fixed 256x256 asset
          // per index (no on-the-fly resizing like pravatar had), so the
          // "thumbnail" is just the same photo rather than a smaller render.
          mediaUrl: img(m.isFemale, `${m.seed}-${k}`),
          thumbnailUrl: img(m.isFemale, `${m.seed}-${k}`),
          fileSizeBytes: 240000 + k * 10000,
          sortOrder: k,
        });
      }
    }

    // --- Industry professionals ---
    const industryProfiles = [];
    for (let i = 0; i < ORGANIZERS.length; i++) {
      const o = ORGANIZERS[i];
      const user = await User.create({
        email: `organizer${i + 1}${DEMO_EMAIL_SUFFIX}`,
        password: DEMO_PASSWORD,
        role: 'industry_professional',
      });
      const profile = await IndustryProfile.create({
        userId: user._id,
        organizationName: o.org,
        organizationType: o.type,
        country: o.country,
        description: o.desc,
        website: o.site,
        isPublished: true,
        isVerified: o.verified,
      });
      industryProfiles.push({ profile, meta: o, userId: user._id });
    }

    // --- Pageant organizers ---
    for (let i = 0; i < PAGEANTS.length; i++) {
      const p = PAGEANTS[i];
      const user = await User.create({
        email: `pageant${i + 1}${DEMO_EMAIL_SUFFIX}`,
        password: DEMO_PASSWORD,
        role: 'pageant_organizer',
      });
      await PageantOrgProfile.create({
        userId: user._id,
        organizationName: p.org,
        country: p.country,
        pageantHistory: [
          { pageantName: `${p.org} 2024`, year: 2024, description: 'Annual national final.' },
        ],
        officialStatus: p.status,
        isPublished: true,
        isVerified: false,
      });
    }

    // --- Casting calls (owned round-robin by the industry profiles) ---
    const castings = [];
    for (let i = 0; i < CASTINGS.length; i++) {
      const c = CASTINGS[i];
      const owner = industryProfiles[i % industryProfiles.length];
      const deadline = new Date(Date.now() + c.days * 86400000);
      const casting = await CastingCall.create({
        creatorProfileId: owner.profile._id,
        creatorType: 'industry_professional',
        title: c.title,
        country: c.country,
        category: c.category,
        criteria: {
          minAge: c.minAge,
          maxAge: c.maxAge,
          minHeightCm: c.minH,
          maxHeightCm: c.maxH,
          experienceLevel: 'any',
          requiredSkills: c.skills,
        },
        description: c.desc,
        applicationDeadline: deadline,
        status: c.forceClose ? 'closed' : 'open',
      });
      castings.push(casting);
    }

    // --- Applications (each model applies to a few relevant-ish castings) ---
    const statuses = ['submitted', 'shortlisted', 'accepted', 'rejected'];
    let statusCursor = 0;
    const acceptedApplications = [];
    for (let i = 0; i < modelProfiles.length; i++) {
      const { profile } = modelProfiles[i];
      const targets = [castings[i % castings.length], castings[(i + 3) % castings.length]];
      for (const casting of targets) {
        if (casting.status !== 'open' && casting.status !== 'closed') continue;
        const status = statuses[statusCursor % statuses.length];
        statusCursor++;
        try {
          const application = await Application.create({
            castingCallId: casting._id,
            modelProfileId: profile._id,
            status,
          });
          if (status === 'accepted')
            acceptedApplications.push({ application, modelUserEmail: null, profile, casting });
        } catch (e) {
          if (e.code !== 11000) throw e; // ignore duplicate (castingId, modelProfileId) pairs
        }
      }
    }

    // --- Messages for accepted applications (simulate a short back-and-forth) ---
    for (const { application, casting } of acceptedApplications) {
      const modelUser = await User.findOne({
        _id: (await ModelProfile.findById(application.modelProfileId)).userId,
      });
      const ownerProfile = await IndustryProfile.findById(casting.creatorProfileId);
      const organizerUser = ownerProfile ? await User.findOne({ _id: ownerProfile.userId }) : null;
      if (!modelUser || !organizerUser) continue;

      await Message.create({
        applicationId: application._id,
        senderId: organizerUser._id,
        content: `Congratulations! We'd love to have you for "${casting.title}". Are you available on short notice?`,
      });
      await Message.create({
        applicationId: application._id,
        senderId: modelUser._id,
        content: 'Yes, I am available! Excited to be part of this.',
      });
      await Message.create({
        applicationId: application._id,
        senderId: organizerUser._id,
        content: "Great, we'll send over the call sheet shortly.",
      });

      await Notification.create({
        userId: modelUser._id,
        type: 'application_update',
        message: `Your application for "${casting.title}" was accepted!`,
        link: '/applications',
      });
    }

    // A few more varied notifications so the bell icon isn't empty for everyone
    await Notification.create({
      userId: modelProfiles[1].profile.userId,
      type: 'application_update',
      message: 'Your application status was updated to "shortlisted".',
      link: '/applications',
    });
    await Notification.create({
      userId: modelProfiles[0].profile.userId,
      type: 'system_alert',
      message: 'Congratulations! Your profile has been verified by an admin.',
      link: `/p/${modelProfiles[0].profile._id}`,
    });
    await Notification.create({
      userId: industryProfiles[0].userId,
      type: 'system_alert',
      message: 'Your casting call "Spring/Summer Runway Show" is getting strong interest.',
      link: '/castings',
    });

    // --- A couple of reports for the admin dashboard ---
    const reporter = modelProfiles[2].profile.userId;
    await Report.create({
      reporterId: reporter,
      targetType: 'casting_call',
      targetId: castings[2]._id,
      reason: 'Listing seems to ask for personal payment before the shoot, which feels off.',
      status: 'open',
    });
    await Report.create({
      reporterId: modelProfiles[4].profile.userId,
      targetType: 'profile',
      targetId: industryProfiles[1].profile._id,
      reason: 'Organization details do not match their public website.',
      status: 'reviewed',
    });

    // --- A couple of admin action log entries so that view isn't empty either ---
    await AdminActionLog.create({
      adminId: admin._id,
      action: 'profile.verify',
      targetType: 'model_profile',
      targetId: modelProfiles[0].profile._id,
      metadata: { note: 'seed data' },
    });
    await AdminActionLog.create({
      adminId: admin._id,
      action: 'report.resolve',
      targetType: 'report',
      targetId: null,
      metadata: { note: 'seed data' },
    });

    console.log('\nDemo data seeded successfully. All accounts share the password:', DEMO_PASSWORD);
    console.log('\nSample accounts:');
    console.log(`  admin              admin${DEMO_EMAIL_SUFFIX}`);
    console.log(
      `  model              model1${DEMO_EMAIL_SUFFIX}  (${MODELS[0].fullName}, verified)`,
    );
    console.log(`  industry_professional  organizer1${DEMO_EMAIL_SUFFIX}  (${ORGANIZERS[0].org})`);
    console.log(`  pageant_organizer  pageant1${DEMO_EMAIL_SUFFIX}  (${PAGEANTS[0].org})`);
    console.log(
      `\n${MODELS.length} models, ${ORGANIZERS.length} industry profiles, ${PAGEANTS.length} pageant orgs, ${CASTINGS.length} casting calls, ${acceptedApplications.length} accepted applications with chat history.\n`,
    );

    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo data:', error);
    process.exit(1);
  }
};

seedDB();
