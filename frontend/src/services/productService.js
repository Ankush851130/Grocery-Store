import apiClient from './api';

const productService = {
  getProducts: async (params = {}) => {
    return apiClient.get('/products', { params });
  },
  getProductBySlug: async (slug) => {
    return apiClient.get(`/products/${slug}`);
  },
  createProduct: async (payload) => {
    return apiClient.post('/products', payload);
  },
  updateProduct: async (productId, payload) => {
    return apiClient.patch(`/products/${productId}`, payload);
  },
  deleteProduct: async (productId) => {
    return apiClient.delete(`/products/${productId}`);
  },
  getFeaturedProducts: async (limit = 8) => {
    return apiClient.get('/products/featured', { params: { limit } });
  },
  getLatestProducts: async (limit = 8) => {
    return apiClient.get('/products/latest', { params: { limit } });
  },
  getBestSellers: async (limit = 8) => {
    return apiClient.get('/products/best-sellers', { params: { limit } });
  },
};

export default productService;
