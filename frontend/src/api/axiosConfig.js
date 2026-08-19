import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Send cookies with every request
});

// Response interceptor: on 401, clear auth state (handled by AuthContext via event)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default api;
