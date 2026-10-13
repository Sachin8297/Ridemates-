import axios from 'axios';

// __RENDER_URL__ is injected by vite.config.js at build time.
// In development the Vite proxy handles /api → localhost:5001.
// In production this resolves to the Render backend URL.
const isProduction = import.meta.env.PROD;

const baseURL = isProduction
  ? `${__RENDER_URL__}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralised error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
