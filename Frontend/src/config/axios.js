import axios from 'axios';

const API_BASE_URL = 'http://localhost:5176/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    if (error.response?.status === 500) {
      return Promise.reject(new Error('Internal server error. Please try again later.'));
    }

    return Promise.reject(error.response?.data?.message || error.message || 'Something went wrong');
  }
);

// API endpoints
export const endpoints = {
  books: '/books',
  admin: {
    dashboard: {
      orderSummary: '/AdminDashboard/dashboard/order-summary',
      genres: '/AdminDashboard/dashboard/genres',
      orderStatus: '/AdminDashboard/dashboard/order-status',
      monthlySales: '/AdminDashboard/dashboard/monthly-sales',
      newMembers: '/AdminDashboard/dashboard/new-members',
      topBestsellers: '/AdminDashboard/dashboard/top-bestsellers',
      totalSales: '/AdminDashboard/dashboard/total-sales'
    }
  }
};

export default axiosInstance;
