const express = require('express');
const {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getLatestProducts,
  getBestSellers,
} = require('../controllers/product.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/latest', getLatestProducts);
router.get('/best-sellers', getBestSellers);
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, authorizeRoles('admin'), createProduct);
router.patch('/:id', protect, authorizeRoles('admin'), updateProduct);
router.delete('/:id', protect, authorizeRoles('admin'), deleteProduct);

module.exports = router;
