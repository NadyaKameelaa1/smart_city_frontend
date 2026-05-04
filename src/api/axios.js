import axios from 'axios';

const api = axios.create({
    baseURL: `https://apismartcity.qode.my.id/api`,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    // withCredentials: true, 
});

// Otomatis inject token berdasarkan halaman
api.interceptors.request.use((config) => {
  const pathname = window.location.pathname;
  const isSuperAdminRoute = pathname.startsWith("/super-admin") || pathname.startsWith("/superadmin");
  const isAdminRoute = pathname.startsWith("/admin");

  const token = isSuperAdminRoute
    ? localStorage.getItem("superadmin_token")
    : isAdminRoute
      ? localStorage.getItem("admin_token")
      : localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
