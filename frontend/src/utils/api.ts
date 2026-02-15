import axios from 'axios';
import Cookies from 'js-cookie';

const getBaseURL = () => {
  // 1. Prioritas Utama: Gunakan URL Produksi Cloud
  // Ini memastikan APK Android bisa diakses dari internet publik (bukan cuma localhost)
  return 'https://api-absensi.infiatin.cloud';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
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
