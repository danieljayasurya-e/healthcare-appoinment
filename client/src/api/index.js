import axios from 'axios';
import { APP_CONFIG, ERROR_MESSAGES } from '../utils/constants';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: APP_CONFIG.API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      const existingToken = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
      if (existingToken) {
        localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
        window.location.href = '/login';
      }
    } else if (status === 403) console.error(ERROR_MESSAGES.FORBIDDEN);
    else if (status === 404) console.error(ERROR_MESSAGES.NOT_FOUND);
    else if (status >= 500) console.error(ERROR_MESSAGES.SERVER_ERROR);
    return Promise.reject(error.response?.data || error);
  },
);

export default API;
