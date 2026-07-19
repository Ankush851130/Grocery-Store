import apiClient from './api';

const authService = {
  register: async (payload) => {
    return apiClient.post('/auth/register', payload);
  },
  login: async (payload) => {
    return apiClient.post('/auth/login', payload);
  },
  logout: async () => {
    return apiClient.post('/auth/logout');
  },
  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },
  refreshToken: async () => {
    return apiClient.post('/auth/refresh-token');
  },
  updateProfile: async (payload) => {
    return apiClient.patch('/auth/profile', payload);
  },
  changePassword: async (payload) => {
    return apiClient.patch('/auth/change-password', payload);
  },
};

export default authService;
