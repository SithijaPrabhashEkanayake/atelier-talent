// Ensures a model and a recruiter (or pageant organiser) have an accepted
// application and a short conversation, so the documented demo logins can
// open the chat ("Direct Chat" / "Direct Line") straight away.
const User = require('../models/User');
const ModelProfile = require('../models/ModelProfile');
const IndustryProfile = require('../models/IndustryProfile');
const PageantOrgProfile = require('../models/PageantOrgProfile');
const CastingCall = require('../models/CastingCall');
const Application = require('../models/Application');
const Message = require('../models/Message');

const SAMPLE_CONVERSATION = [
  (title) => `Congratulations! We would love to have you for "${title}". Are you available at short notice?`,
  () => 'Yes, I am available and excited to be part of this.',
  () => "Great, we will send over the call sheet shortly.",
];

const findOrganiser = async (userId) => {
  const industry = await IndustryProfile.findOne({ userId });
  if (industry) return { profile: industry, creatorType: 'industry_professional' };
  const pageant = await PageantOrgProfile.findOne({ userId });
  if (pageant) return { profile: pageant, creatorType: 'pageant_organizer' };
  return null;
};

const ensureAcceptedChat = async (modelEmail, organiserEmail, country = 'Sri Lanka') => {
  const modelUser = await User.findOne({ email: modelEmail });
  const orgUser = await User.findOne({ email: organiserEmail });
  if (!modelUser || !orgUser) return null;

  const modelProfile = await ModelProfile.findOne({ userId: modelUser._id });
  const organiser = await findOrganiser(orgUser._id);
  if (!modelProfile || !organiser) return null;

  let casting = await CastingCall.findOne({
    creatorProfileId: organiser.profile._id,
    status: 'open',
  });
  if (!casting) {
    casting = await CastingCall.create({
      creatorProfileId: organiser.profile._id,
      creatorType: organiser.creatorType,
      title: `${organiser.profile.organizationName} — Open Call`,
      description: 'Open call for talent to join a live production.',
      country,
      category: organiser.creatorType === 'pageant_organizer' ? 'pageant' : 'runway',
      applicationDeadline: new Date(Date.now() + 30 * 86400000),
      status: 'open',
    });
  }

  const application = await Application.findOneAndUpdate(
    { castingCallId: casting._id, modelProfileId: modelProfile._id },
    { $set: { status: 'accepted', statusUpdatedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const existing = await Message.countDocuments({ applicationId: application._id });
  if (existing === 0) {
    const messages = [
      { senderId: orgUser._id, content: SAMPLE_CONVERSATION[0](casting.title) },
      { senderId: modelUser._id, content: SAMPLE_CONVERSATION[1]() },
      { senderId: orgUser._id, content: SAMPLE_CONVERSATION[2]() },
    ];
    for (const m of messages) {
      await Message.create({ applicationId: application._id, ...m });
    }
  }
  return application;
};

module.exports = { ensureAcceptedChat };
