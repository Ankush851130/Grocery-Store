import apiClient from './api';

const adminService = {
  getDashboardStats: async () => {
    return apiClient.get('/admin/dashboard');
  },
  getUsers: async (params = {}) => {
    return apiClient.get('/admin/users', { params });
  },
  updateUserRole: async (userId, payload) => {
    return apiClient.patch(`/admin/users/${userId}/role`, payload);
  },
  getProducts: async (params = {}) => {
    return apiClient.get('/admin/products', { params });
  },
  getOrders: async (params = {}) => {
    return apiClient.get('/admin/orders', { params });
  },
};

export default adminService;
