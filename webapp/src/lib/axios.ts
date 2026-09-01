import axios from 'axios';
import { getAccessToken } from './tokenStore';

/**
 * Shared Axios instance. Base URL always comes from the environment —
 * never hardcode it, so the same build works against local/staging/prod
 * backends by swapping VITE_API_URL.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // needed so the httpOnly refresh-token cookie is sent
});

/**
 * Attach the current in-memory access token to every request.
 */
api.interceptors.request.use((config) => {
  const token = getAccessToken();
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