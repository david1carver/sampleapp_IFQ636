import axios from 'axios';

// Single axios instance for the whole app.
//
// baseURL points at the backend API:
//   - keep the localhost line for local development
//   - before deploying to EC2, comment it out and uncomment the "live" line,
//     replacing the IP with your instance's Public IPv4 address (SOP Step 47)
//
// The request interceptor attaches the JWT from localStorage to every request,
// so pages can call axiosInstance.get('/api/...') without setting the header.

const STORAGE_KEY = 'mesa.auth';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local development
  // baseURL: 'http://YOUR_EC2_PUBLIC_IP:5001', // live (EC2) — set your public IP, then push to main
  headers: { 'Content-Type': 'application/json' },
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
      // Ignore — request goes unauthenticated and the backend will 401 if it needs auth.
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
