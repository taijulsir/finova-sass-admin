import axios from 'axios';
import { useAuthStore } from './store'; // Will create this

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies (refresh token)
});

// Request interceptor: Add access token to headers
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Specific logic for 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Do not attempt to refresh token if the request was for login
      if (originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Attempt refresh
        const { data } = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {}, // No body needed
          { withCredentials: true }
        );

        const { accessToken } = data.data;
        
        // Update store
        useAuthStore.getState().setToken(accessToken);

        // Update failed request header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (token expired/invalid) - logout
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'; // Redirect to login
        }
        return Promise.reject(error); // Return original error to preserve the message
      }
    }
    return Promise.reject(error);
  }
);

export default api;
