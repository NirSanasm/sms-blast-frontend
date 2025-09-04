import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// Admin API
export const adminAPI = {
  login: (password) => api.post('/api/admin/auth', { password }),
  uploadContacts: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getMessages: () => api.get('/api/admin/messages'),
  createMessage: (message) => api.post('/api/admin/messages', message),
  updateMessage: (id, message) => api.put(`/api/admin/messages/${id}`, message),
  deleteMessage: (id) => api.delete(`/api/admin/messages/${id}`),
  getStats: () => api.get('/api/admin/stats'),
  downloadTemplate: () => api.get('/api/admin/template', { responseType: 'blob' }),
};

// User API
export const userAPI = {
  getRandomContacts: (messageId, userSession) => 
    api.get(`/api/user/random-contacts?message_id=${messageId}&user_session=${userSession}`),
  sendSMSBatch: (data) => api.post('/api/user/send-batch', data),
  sendWhatsAppBatch: (data) => api.post('/api/user/send-whatsapp', data),
  getStats: () => api.get('/api/user/stats'),
  getMessages: () => api.get('/api/user/messages'),
};

// Search API
export const searchAPI = {
  searchPhone: (query, limit = 10) => 
    api.get(`/api/search/phone?q=${encodeURIComponent(query)}&limit=${limit}`),
};

// Utility function to generate user session ID
export const generateUserSession = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default api;