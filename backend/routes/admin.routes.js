const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  getProducts,
  getOrders,
} = require('../controllers/admin.controller');
const { authorizeRoles, protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/products', getProducts);
router.get('/orders', getOrders);

module.exports = router;
