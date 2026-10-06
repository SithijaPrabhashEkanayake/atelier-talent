const { getJwtSecret } = require('../utils/jwtSecret');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Application = require('../models/Application');
const IndustryProfile = require('../models/IndustryProfile');
const PageantOrgProfile = require('../models/PageantOrgProfile');
const ModelProfile = require('../models/ModelProfile');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Authentication error: Token required'));

      const decoded = jwt.verify(
        token,
        getJwtSecret(),
        { algorithms: ['HS256'] },
      );
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error(`Authentication error: ${err.message}`));
    }
  });

  // Shared authorization check for chat applications
  const isAuthorizedForApplication = async (user, applicationId) => {
    const application = await Application.findById(applicationId).populate('castingCallId');
    if (!application || application.status !== 'accepted') return false;

    if (user.role === 'model') {
      const modelProfile = await ModelProfile.findOne({ userId: user.id });
      return !!(
        modelProfile && application.modelProfileId.toString() === modelProfile._id.toString()
      );
    }

    let creatorProfile;
    if (user.role === 'industry_professional')
      creatorProfile = await IndustryProfile.findOne({ userId: user.id });
    if (user.role === 'pageant_organizer')
      creatorProfile = await PageantOrgProfile.findOne({ userId: user.id });

    return !!(
      creatorProfile &&
      application.castingCallId.creatorProfileId.toString() === creatorProfile._id.toString()
    );
  };

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.id})`);

    // Join personal notification and event room
    const userRoom = `user:${socket.user.id}`;
    socket.join(userRoom);
    console.log(`Socket ${socket.id} joined personal room ${userRoom}`);

    // Join a room specific to an application (chat between accepted model and recruiter)
    socket.on('join_match', async (applicationId) => {
      try {
        const isAuthorized = await isAuthorizedForApplication(socket.user, applicationId);

        if (isAuthorized) {
          socket.join(applicationId);
          console.log(`User ${socket.user.id} joined match room ${applicationId}`);
          socket.emit('joined_match', { applicationId });
        } else {
          socket.emit('error', 'Not authorized to join this match');
        }
      } catch (err) {
        console.error('join_match error:', err);
        socket.emit('error', 'Server error');
      }
    });

    socket.on('send_message', async (data) => {
      try {
        const { applicationId, content } = data;

        const isAuthorized = await isAuthorizedForApplication(socket.user, applicationId);
        if (!isAuthorized) {
          return socket.emit('error', 'Not authorized to send messages in this conversation');
        }

        if (typeof content !== 'string' || !content.trim() || content.length > 2000) {
          return socket.emit('error', 'Invalid message content');
        }

        const message = await Message.create({
          applicationId,
          senderId: socket.user.id,
          content,
        });

        // Broadcast to application room
        io.to(applicationId).emit('receive_message', message);
      } catch (err) {
        console.error('send_message error:', err);
        socket.emit('error', 'Failed to send message');
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };
