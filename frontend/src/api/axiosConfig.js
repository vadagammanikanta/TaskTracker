import axios from 'axios';

// Normalize baseURL: ensures /api is always appended even if user set VITE_API_URL without /api
let rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
let cleanBaseURL = rawBaseURL.trim().replace(/\/+$/, '');
if (!cleanBaseURL.endsWith('/api')) {
  cleanBaseURL += '/api';
}

const api = axios.create({
  baseURL: cleanBaseURL,
  withCredentials: true, // Send cookies with every request
});

// Request interceptor: attach token from localStorage if available (ensures cross-domain auth works)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on 401, clear auth state
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default api;
