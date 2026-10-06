require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const helmet = require('helmet');
const { createRateLimiter, mongoSanitize } = require('./middleware/security');
const { csrfProtection } = require('./middleware/csrfMiddleware');

// Connect to database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

app.set('trust proxy', 1);

// Middleware
// Explicit CSP directives — helmet's default img-src ('self' data:) blocks
// every portfolio photo, since those are hotlinked from Cloudinary (real
// uploads) or xsgames.co/images.unsplash.com (seed/demo data); its
// default style-src also blocks the Google Fonts @import in index.css.
// This mirrors frontend/nginx.conf's CSP header, which the Docker/Nginx
// deployment path already uses — kept in sync so both hosting paths
// (this single-service Node deploy and the Nginx one) behave the same.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'https:', 'data:'],
        mediaSrc: ["'self'", 'https:'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
    credentials: true,
  }),
);
app.use(csrfProtection);
app.use(mongoSanitize);

// Basic route for testing & CSRF initialization
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running', version: '1.0.0' });
});

app.get('/api/csrf-token', (req, res) => {
  res.status(200).json({ success: true, csrfToken: req.csrfToken });
});

// A generous baseline limit on every API route — previously only /api/auth
// was throttled, leaving every other endpoint (including the Cloudinary
// upload route) with no abuse protection at all.
const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests, please slow down.',
});
app.use('/api', apiRateLimiter);

// Auth endpoints get a tighter rate limit on top of that — they're the
// brute-force / credential-stuffing / account-enumeration surface.
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10, // matches Docs/Security_Data_Protection_Policy.md's documented rate limit
  message: 'Too many auth attempts, please try again in a few minutes.',
});
// Session checks (/auth/me, /auth/refresh) run on every page load and must not
// count toward the brute-force budget, or normal browsing locks people out.
app.use(
  ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password'],
  authRateLimiter,
);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.get('/api/stats', require('./controllers/statsController').getPlatformStats);

app.use('/api/profiles', require('./routes/profileRoutes'));
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/castings', require('./routes/castingRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/analytics', require('./routes/analyticsRoutes'));
app.use('/api/match', require('./routes/matchRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Single-origin production hosting: serve the built React app from this
// same Express server so the frontend and API share one domain. This
// matters beyond convenience — the refresh-token cookie is `sameSite:
// 'strict'` and CSRF uses a double-submit cookie the frontend must read
// off the same origin; splitting the frontend onto a different host
// (e.g. a separate static host) would silently break both. Must be
// registered after all /api routes so it only ever catches page requests.
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const frontendDist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handling middleware (the unused `_next` param is required — Express
// only recognizes a 4-arg function as error-handling middleware).
// Always log the full error server-side, but only echo `err.message` to the
// client outside production — in production it can be a raw driver/ORM
// message (e.g. a MongoDB duplicate-key error names the database,
// collection, and index), which is internal detail a client never needs.
app.use((err, req, res, _next) => {
  console.error(err.stack);

  // A malformed :id param (not a valid ObjectId) is a client mistake, not a
  // server failure — several controllers pass req.params straight into
  // findById() with no upfront validation and previously all surfaced here
  // as a generic 500 via Mongoose's CastError.
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res
      .status(400)
      .json({ success: false, errorCode: 'VALIDATION_ERROR', message: 'Invalid id format' });
  }

  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.statusCode || 500).json({
    success: false,
    message: isProd ? 'Server Error' : err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const http = require('http');
const { initSocket } = require('./sockets/chatSocket');
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [PORT IN USE] Port ${PORT} is already occupied by another process.`);
    console.error(`💡 Tip for macOS users: macOS AirPlay Receiver listens on port 5000 by default.`);
    console.error(`   To free port 5000: System Settings > General > AirDrop & AirPlay > Turn OFF 'AirPlay Receiver'.`);
    console.error(`   Alternatively, run on an alternate port: PORT=5001 npm run dev\n`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, _promise) => {
  console.log(`Error: ${err.message}`);
  console.log(err.stack); // ADDED STACK TRACE
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = { app, server };
