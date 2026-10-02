import { create } from 'zustand';
import api, { setAccessToken } from '../api/axiosConfig';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      setAccessToken(token);
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  register: async (email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { email, password, role });
      const { user, token } = response.data;
      setAccessToken(token);
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  logout: async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  // Called once on app load. There's no access token in memory yet at this
  // point (a fresh page load always starts empty) — GET /auth/me will 401,
  // and the axios response interceptor transparently exchanges the httpOnly
  // refresh cookie for a new access token before retrying, so a returning
  // user with a valid session ends up logged in without ever touching
  // localStorage.
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/auth/me');
      set({
        user: response.data.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // No valid session — routine for a first-time or logged-out visitor,
      // not worth logging as an error.
      setAccessToken(null);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

export default useAuthStore;
