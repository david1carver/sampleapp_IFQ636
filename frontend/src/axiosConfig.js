// Axios instance with the API base URL pre-configured and a request interceptor
// that automatically attaches the bearer token from localStorage to every request.
// This means individual page components can call `axiosInstance.post(...)` without
// having to remember to add the Authorization header.

import axios from 'axios';

const STORAGE_KEY = 'mesa.auth';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { token } = JSON.parse(raw);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // Ignore - request will go unauthenticated and backend will 401 if it needs auth.
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;