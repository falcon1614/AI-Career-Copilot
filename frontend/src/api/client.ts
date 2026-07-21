import axios from 'axios';

const BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) 
  || 'http://localhost:3000';

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((res) => res, async (err) => {
  if (err.response?.status === 401) {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken: refresh });
        localStorage.setItem('access_token', data.data.accessToken);
        localStorage.setItem('refresh_token', data.data.refreshToken);
        err.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(err.config);
      } catch { localStorage.clear(); window.location.href = '/login'; }
    }
  }
  return Promise.reject(err);
});

export default api;
