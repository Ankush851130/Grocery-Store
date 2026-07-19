const express = require('express');
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrderInvoice,
  updateOrderTracking,
  getAllOrders,
} = require('../controllers/order.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/invoice/:id', protect, getOrderInvoice);
router.patch('/:id/cancel', protect, cancelOrder);
router.patch('/:id/tracking', protect, authorizeRoles('admin'), updateOrderTracking);
router.get('/admin/all', protect, authorizeRoles('admin'), getAllOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;
