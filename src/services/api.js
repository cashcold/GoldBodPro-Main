import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return `${envUrl.trim().replace(/\/$/, '')}/api`;
  }
  // Default to relative /api so it works seamlessly on Google AI Studio, Heroku, custom domains, and localhost
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('goldbod_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with automatic fallback to local /api if external backend fails with 404 or network error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If the request failed on an external host and hasn't been retried yet, retry against relative /api
    if (
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.baseURL &&
      originalRequest.baseURL !== '/api' &&
      (error.response?.status === 404 || !error.response || error.code === 'ERR_NETWORK')
    ) {
      originalRequest._retry = true;
      originalRequest.baseURL = '/api';
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;