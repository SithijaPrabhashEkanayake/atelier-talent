import axios from 'axios';

// In a production build with no explicit VITE_API_URL, default to a
// same-origin relative path — this is what makes the single-service
// Render deploy work (backend serves this build and the API from one
// origin). Dev keeps the explicit localhost:5000 default.
const defaultBaseURL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
  withCredentials: true, // Send cookies for refresh token
  timeout: 15000, // a hung request previously left the UI spinning forever
});

// The access token lives in memory only — never localStorage/sessionStorage.
// A token in Web Storage is readable by any injected script (XSS = full
// account takeover); an in-memory value is not. On a fresh page load there
// is no token yet, so the first authenticated request gets a 401, which the
// response interceptor below turns into a silent POST /auth/refresh (using
// the httpOnly refresh cookie) before retrying — see useAuthStore.checkAuth.
let accessToken = null;
export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => {
  accessToken = token;
};

// Read the readable (non-httpOnly) XSRF-TOKEN cookie the backend's
// double-submit CSRF middleware sets (backend/middleware/csrfMiddleware.js).
// It's set on any GET and must be echoed back as a header on every
// state-mutating request or the backend rejects it with 403
// CSRF_VALIDATION_FAILED.
const getCsrfCookie = () => {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const SAFE_METHODS = new Set(['get', 'head', 'options']);

// Request interceptor to add the access token and CSRF header
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (!SAFE_METHODS.has((config.method || 'get').toLowerCase())) {
      const csrfToken = getCsrfCookie();
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Several requests can 401 at once (e.g. a page that fires 3 parallel GETs
// on mount before the token is refreshed) — without de-duping, each one
// would call POST /auth/refresh independently. Since refresh tokens rotate
// on every use (the old one is revoked server-side the instant a new one is
// issued — see authController.refresh), the second concurrent call would
// present an already-revoked cookie and fail, incorrectly logging the user
// out. Sharing one in-flight refresh promise across all of them fixes that.
let refreshPromise = null;
const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then((response) => {
        const { token } = response.data;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loop if the refresh endpoint itself fails
      if (originalRequest.url === '/auth/refresh') {
        setAccessToken(null);
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const token = await refreshAccessToken();

        // Update auth header and retry original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        setAccessToken(null);
        // You could also trigger a redirect to login here if needed
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
