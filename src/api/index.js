import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://41.216.191.37:8000/api',
    headers: { 'Content-Type': 'application/json' }
});

export default api;
