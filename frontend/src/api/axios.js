import axios from 'axios';

const currentHost = window.location.hostname;

const api = axios.create({
    baseURL: `http://localhost:8000/api`,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true, 
});

// Otomatis inject token berdasarkan halaman
api.interceptors.request.use((config) => {
  // Cek apakah request dari panel admin
  const isAdminRoute = window.location.pathname.startsWith("/admin");

  const token = isAdminRoute
    ? localStorage.getItem("admin_token")
    : localStorage.getItem("token"); // token user biasa

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;