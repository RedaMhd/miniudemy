import axios from 'axios';

const gatewayURL = import.meta.env.VITE_GATEWAY_URL ?? '';
const baseURL = `${gatewayURL}/api`;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
