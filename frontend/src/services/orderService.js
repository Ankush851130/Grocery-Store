import apiClient from './api';

const orderService = {
  placeOrder: async (payload) => {
    return apiClient.post('/orders', payload);
  },
  getMyOrders: async () => {
    return apiClient.get('/orders/my-orders');
  },
  getOrderById: async (orderId) => {
    return apiClient.get(`/orders/${orderId}`);
  },
  cancelOrder: async (orderId, payload = {}) => {
    return apiClient.patch(`/orders/${orderId}/cancel`, payload);
  },
  getOrderInvoice: async (orderId) => {
    return apiClient.get(`/orders/invoice/${orderId}`);
  },
  updateOrderTracking: async (orderId, payload) => {
    return apiClient.patch(`/orders/${orderId}/tracking`, payload);
  },
};

export default orderService;
