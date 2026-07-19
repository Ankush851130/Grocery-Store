const express = require('express');
const {
  createGatewayOrder,
  verifyPayment,
  getPaymentKey,
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/razorpay/key', protect, getPaymentKey);
router.post('/razorpay/create-order', protect, createGatewayOrder);
router.post('/razorpay/verify', protect, verifyPayment);

module.exports = router;
