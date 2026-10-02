const Notification = require('../models/Notification');
const { getIO } = require('../sockets/socketManager');

/**
 * Creates a persistent notification in MongoDB and emits it in real-time
 * via Socket.io to the targeted user's personal room (`user:<userId>`).
 *
 * @param {Object} options
 * @param {string|ObjectId} options.userId - Target recipient's User ID
 * @param {'application_update'|'system_alert'|'casting_update'|'match_alert'|'message_alert'} options.type
 * @param {string} options.message - Human-readable message
 * @param {string} [options.link] - Optional app route to redirect on click
 * @param {Object} [options.metadata] - Optional arbitrary payload for client-side state updates
 * @returns {Promise<Document>} The saved Notification document
 */
const createNotification = async ({ userId, type, message, link, metadata = {} }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      message,
      link,
    });

    const io = getIO();
    if (io) {
      const room = `user:${userId.toString()}`;
      // Generic real-time notification event
      io.to(room).emit('notification:new', {
        _id: notification._id,
        userId: notification.userId,
        type: notification.type,
        message: notification.message,
        link: notification.link,
        read: notification.read,
        createdAt: notification.createdAt,
        metadata,
      });

      // Specific event triggers for granular reactive listeners
      if (type === 'application_update') {
        io.to(room).emit('application:status_changed', {
          notificationId: notification._id,
          message,
          metadata,
        });
      } else if (type === 'casting_update') {
        io.to(room).emit('casting:updated', {
          notificationId: notification._id,
          message,
          metadata,
        });
      }
    }

    return notification;
  } catch (err) {
    console.error('Failed to create or emit notification:', err);
    throw err;
  }
};

/**
 * Emits an arbitrary real-time event to a specific user's private socket room.
 *
 * @param {string|ObjectId} userId
 * @param {string} event
 * @param {any} payload
 */
const emitToUser = (userId, event, payload) => {
  const io = getIO();
  if (io && userId) {
    io.to(`user:${userId.toString()}`).emit(event, payload);
  }
};

/**
 * Broadcasts an event to all connected sockets.
 *
 * @param {string} event
 * @param {any} payload
 */
const broadcast = (event, payload) => {
  const io = getIO();
  if (io) {
    io.emit(event, payload);
  }
};

module.exports = {
  createNotification,
  emitToUser,
  broadcast,
};
