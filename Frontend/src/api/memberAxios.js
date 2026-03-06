import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL || '';

const memberApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

memberApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('memberToken');
    if (token) {
      config.headers.Authorization = token;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

memberApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('memberToken');
      localStorage.removeItem('memberName');
      localStorage.removeItem('memberEmail');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default memberApi;
