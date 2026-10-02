// Shared, capped pagination parsing. Every list endpoint previously did its
// own `const { page = 1, limit = 20 } = req.query` and passed the raw
// string straight into `.limit(limit * 1)` — a client could request
// `?limit=999999999` (or a non-numeric value, coercing to NaN and disabling
// the limit entirely) and force an unbounded collection scan/response.
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePagination = (query, { defaultLimit = DEFAULT_LIMIT, maxLimit = MAX_LIMIT } = {}) => {
  const pageNum = Math.max(1, parseInt(query.page, 10) || 1);
  const requestedLimit = parseInt(query.limit, 10);
  const limitNum =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, maxLimit)
      : defaultLimit;
  return { page: pageNum, limit: limitNum, skip: (pageNum - 1) * limitNum };
};

module.exports = { parsePagination };
