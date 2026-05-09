import axios from 'axios';

// Use Vite's environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const teacher = sessionStorage.getItem('teacher');
    if (teacher) {
      config.headers['X-Teacher-ID'] = JSON.parse(teacher).teacherId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('teacher');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;