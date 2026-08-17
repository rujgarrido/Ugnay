import axios from 'axios';

/**
 * Shared Axios instance. Base URL always comes from the environment —
 * never hardcode it, so the same build works against local/staging/prod
 * backends by swapping VITE_API_URL.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // needed if the JWT is carried in an httpOnly cookie
});

/**
 * Attach the auth token to every request, once auth exists.
 * Placeholder — wire this up to real token storage in Section 12/9 of the
 * implementation guide (Authentication feature).
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token'); // revisit storage choice — see docs
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized place to handle 401s (redirect to login), toasts, etc.
    return Promise.reject(error);
  },
);
