import axios from 'axios';
import { APP_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from '../utils/constants';

export const API = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
    timeout: APP_CONFIG.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

API.interceptors.request.use(config => {
    const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});


API.interceptors.response.use(response => {
    return response.data;
}, error => {
    if (error.response?.status === 401) {
      localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error(ERROR_MESSAGES.FORBIDDEN);
    } else if (error.response?.status === 404) {
      console.error(ERROR_MESSAGES.NOT_FOUND);
    } else if (error.response?.status >= 500) {
      console.error(ERROR_MESSAGES.SERVER_ERROR);
    }

    return Promise.reject(error.response?.data || error);
});