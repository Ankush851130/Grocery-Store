import apiClient from './api';

const paymentService = {
  getRazorpayKey: async () => {
    return apiClient.get('/payments/razorpay/key');
  },
  createRazorpayOrder: async (payload) => {
    return apiClient.post('/payments/razorpay/create-order', payload);
  },
  verifyRazorpayPayment: async (payload) => {
    return apiClient.post('/payments/razorpay/verify', payload);
  },
};

export default paymentService;
