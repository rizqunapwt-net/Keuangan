import axios from 'axios';
import Cookies from 'js-cookie';

const getBaseURL = () => {
  // 1. Manually set environment variable takes precedence
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // 2. Production Domain Detection
    if (hostname === 'absensi.infiatin.cloud') {
      return 'https://api-absensi.infiatin.cloud';
    }

    // 3. Local Network/IP Handling (detects if port 3000 is intended for backend)
    return `http://${hostname}:3000`;
  }

  return 'http://localhost:3000';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
