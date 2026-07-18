import { create } from 'zustand';
import api from '../api/client';
interface User { id: string; email: string; fullName: string; }
interface AuthState {
  user: User | null; isLoading: boolean; isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null, isLoading: false,
  isAuthenticated: !!localStorage.getItem('access_token'),
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('access_token', data.data.accessToken);
      localStorage.setItem('refresh_token', data.data.refreshToken);
      set({ user: data.data.user, isAuthenticated: true });
    } finally { set({ isLoading: false }); }
  },
  register: async (email, password, fullName) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/api/auth/register', { email, password, fullName });
      localStorage.setItem('access_token', data.data.accessToken);
      localStorage.setItem('refresh_token', data.data.refreshToken);
      set({ user: data.data.user, isAuthenticated: true });
    } finally { set({ isLoading: false }); }
  },
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) await api.post('/api/auth/logout', { refreshToken });
    } finally { localStorage.clear(); set({ user: null, isAuthenticated: false }); }
  },
  fetchMe: async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      set({ user: data.data, isAuthenticated: true });
    } catch { localStorage.clear(); set({ user: null, isAuthenticated: false }); }
  },
}));
