// Lightweight, dependency-free security middleware. Deliberately avoids
// pulling in helmet/express-rate-limit/express-mongo-sanitize so these fixes
// don't depend on npm registry access being available in every environment
// this app is set up in — swap for the real packages if/when that's not a
// constraint.

// A reasonable baseline subset of what Helmet sets by default.
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.removeHeader('X-Powered-By');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }
  next();
};

// Small in-memory sliding-window rate limiter, keyed by client IP.
// NOTE: in-memory means limits are per-process — fine for a single backend
// instance, but would need a shared store (e.g. Redis) behind a
// multi-instance/load-balanced deployment.
const createRateLimiter = ({ windowMs, max, message }) => {
  const hits = new Map();

  // Periodically drop stale entries so this doesn't grow unbounded.
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (now > entry.resetAt) hits.delete(key);
    }
  }, windowMs).unref?.();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({
        success: false,
        errorCode: 'RATE_LIMITED',
        message: message || 'Too many requests, please try again later.',
      });
    }
    next();
  };
};

// Strip Mongo operator keys ($... or keys containing '.') from
// user-controlled input, in place, so a body like {"email":{"$ne":null}}
// can't change query semantics once it reaches a Mongoose filter. Returns a
// (possibly new) sanitized value for cases where `obj` itself can't be
// mutated in place (see req.query below).
const sanitize = (obj) => {
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    obj[key] = sanitize(obj[key]);
  }
  return obj;
};

const mongoSanitize = (req, res, next) => {
  // req.body and req.params are plain own-properties set by body-parser and
  // the router respectively — mutating them in place is enough.
  sanitize(req.body);
  sanitize(req.params);

  // req.query is different: Express 5 defines it as a GETTER that
  // re-parses req.url on every access (see node_modules/express/lib/
  // request.js), so `sanitize(req.query)` mutates a throwaway object that's
  // discarded immediately — the next `req.query.x` read re-parses the raw,
  // unsanitized URL from scratch. Redefining it as an own data property
  // shadows that prototype getter, so every later read returns this
  // sanitized snapshot instead.
  const cleanQuery = sanitize({ ...req.query });
  Object.defineProperty(req, 'query', {
    value: cleanQuery,
    writable: true,
    configurable: true,
    enumerable: true,
  });

  next();
};

module.exports = { securityHeaders, createRateLimiter, mongoSanitize };
