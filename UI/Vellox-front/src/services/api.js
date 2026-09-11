import axios from 'axios';

// Create a custom Axios instance pointing to your Spring Boot server
const api = axios.create({
  baseURL: 'http://localhost:8100/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// The Interceptor: Runs automatically before every request
api.interceptors.request.use(
  (config) => {
    // Check if we have a JWT token stored in the browser
    const token = localStorage.getItem('vellox_jwt');
    
    // If it exists, append it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('vellox_jwt');
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;