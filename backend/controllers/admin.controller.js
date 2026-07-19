const mongoose = require('mongoose');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

const buildSearchRegex = (value) => {
  return typeof value === 'string' && value.trim().length > 0
    ? new RegExp(value.trim(), 'i')
    : null;
};

const getDashboardStats = asyncHandler(async (req, res) => {
  const [userCount, productCount, orderCount, revenueSummary, recentUsers, recentProducts, recentOrders] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.grandTotal' },
          paidOrders: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0],
            },
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0],
            },
          },
        },
      },
    ]),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role avatar isEmailVerified createdAt'),
    Product.find().sort({ createdAt: -1 }).limit(5).populate('createdBy', 'name email role'),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email role').populate('items.product', 'name slug images brand category unit'),
  ]);

  const revenueData = revenueSummary[0] || {
    totalRevenue: 0,
    paidOrders: 0,
    cancelledOrders: 0,
  };

  return res.status(200).json({
    success: true,
    data: {
      stats: {
        userCount,
        productCount,
        orderCount,
        paidOrders: revenueData.paidOrders || 0,
        cancelledOrders: revenueData.cancelledOrders || 0,
        totalRevenue: revenueData.totalRevenue || 0,
      },
      recentUsers,
      recentProducts,
      recentOrders,
    },
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const searchRegex = buildSearchRegex(req.query.search);
  const filter = {};

  if (searchRegex) {
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
    ];
  }

  if (req.query.role && ['user', 'admin'].includes(req.query.role)) {
    filter.role = req.query.role;
  }

  const [users, totalUsers] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('name email role avatar phone isEmailVerified createdAt updatedAt'),
    User.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    },
  });
});

const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return next(new AppError('Role must be either user or admin', 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.role = role;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: {
      user: user.toSafeObject(),
    },
  });
});

const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const searchRegex = buildSearchRegex(req.query.search);
  const filter = {};

  if (searchRegex) {
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { brand: searchRegex },
      { category: searchRegex },
    ];
  }

  if (req.query.category) {
    filter.category = { $regex: new RegExp(req.query.category.trim(), 'i') };
  }

  if (req.query.brand) {
    filter.brand = { $regex: new RegExp(req.query.brand.trim(), 'i') };
  }

  if (req.query.isFeatured !== undefined && req.query.isFeatured !== '') {
    filter.isFeatured = req.query.isFeatured === 'true';
  }

  if (req.query.isPublished !== undefined && req.query.isPublished !== '') {
    filter.isPublished = req.query.isPublished === 'true';
  }

  const [products, totalProducts] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email role'),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      products,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
      },
    },
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }

  const [orders, totalOrders] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email phone role avatar')
      .populate('items.product', 'name slug images brand category unit'),
    Order.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
      },
    },
  });
});

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserRole,
  getProducts,
  getOrders,
};
