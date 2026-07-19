const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const {
  calculateOrderTotals,
  getCouponByCode,
} = require('../utils/orderPricing');
const {
  validatePlaceOrderPayload,
  validateCancelPayload,
  validateTrackingPayload,
} = require('../validators/order.validators');

const isOrderCancellable = (order) => {
  return ['pending', 'confirmed', 'processing'].includes(order.status);
};

const buildOrderItems = (requestedItems, productsById) => {
  return requestedItems.map((requestedItem) => {
    const product = productsById.get(String(requestedItem.productId));
    const quantity = Number(requestedItem.quantity);
    const discountPrice = typeof product.discountPrice === 'number' && product.discountPrice < product.price
      ? product.discountPrice
      : null;
    const unitPrice = discountPrice ?? product.price;
    const lineTotal = unitPrice * quantity;

    return {
      product: product._id,
      productName: product.name,
      slug: product.slug,
      image: product.images?.[0] || '',
      brand: product.brand,
      category: product.category,
      unit: product.unit || '1 pc',
      quantity,
      unitPrice,
      discountPrice,
      lineTotal,
    };
  });
};

const placeOrder = asyncHandler(async (req, res, next) => {
  const validationErrors = validatePlaceOrderPayload(req.body);

  if (validationErrors.length > 0) {
    return next(new AppError(validationErrors.join(', '), 400));
  }

  const { items, shippingAddress, paymentMethod, couponCode = '', notes = '' } = req.body;
  const requestedProductIds = items.map((item) => String(item.productId));
  const session = await mongoose.startSession();

  let createdOrder = null;

  try {
    await session.withTransaction(async () => {
      const products = await Product.find({ _id: { $in: requestedProductIds }, isPublished: true }).session(session);
      const productsById = new Map(products.map((product) => [String(product._id), product]));

      if (products.length !== requestedProductIds.length) {
        throw new AppError('One or more products are unavailable', 400);
      }

      const orderItems = buildOrderItems(items, productsById);
      const subtotal = orderItems.reduce((total, item) => total + item.lineTotal, 0);
      const appliedCoupon = getCouponByCode(couponCode);
      const totals = calculateOrderTotals({ subtotal, couponCode });

      if (couponCode && !appliedCoupon) {
        throw new AppError('Invalid coupon code', 400);
      }

      if (appliedCoupon && subtotal < appliedCoupon.minSubtotal) {
        throw new AppError(`Coupon ${appliedCoupon.code} requires a minimum order of ${appliedCoupon.minSubtotal}`, 400);
      }

      for (const requestedItem of items) {
        const product = productsById.get(String(requestedItem.productId));
        const quantity = Number(requestedItem.quantity);

        if (product.stock < quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400);
        }

        product.stock -= quantity;
        await product.save({ session, validateBeforeSave: false });
      }

      const order = await Order.create([
        {
          user: req.user._id,
          items: orderItems,
          shippingAddress,
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
          paymentResult: {
            provider: 'razorpay',
          },
          pricing: {
            itemsTotal: subtotal,
            couponCode: totals.couponCode,
            couponLabel: totals.appliedCoupon?.label || '',
            couponDiscount: totals.couponDiscount,
            shippingFee: totals.shippingFee,
            taxAmount: totals.taxAmount,
            grandTotal: totals.grandTotal,
          },
          status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
          tracking: {
            currentStatus: paymentMethod === 'cod' ? 'confirmed' : 'pending',
          },
          notes,
        },
      ], { session });

      createdOrder = order[0];
    });
  } finally {
    session.endSession();
  }

  if (!createdOrder) {
    return next(new AppError('Could not place order right now', 500));
  }

  const populatedOrder = await Order.findById(createdOrder._id)
    .populate('user', 'name email phone avatar role')
    .populate('items.product', 'name slug images brand category unit');

  return res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: {
      order: populatedOrder,
    },
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name slug images brand category unit')
    .populate('user', 'name email phone avatar role');

  return res.status(200).json({
    success: true,
    data: {
      orders,
    },
  });
});

const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name slug images brand category unit')
    .populate('user', 'name email phone avatar role');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const isOwner = String(order.user._id) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(new AppError('You do not have permission to view this order', 403));
  }

  return res.status(200).json({
    success: true,
    data: {
      order,
    },
  });
});

const cancelOrder = asyncHandler(async (req, res, next) => {
  const validationErrors = validateCancelPayload(req.body);

  if (validationErrors.length > 0) {
    return next(new AppError(validationErrors.join(', '), 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const isOwner = String(order.user) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(new AppError('You do not have permission to cancel this order', 403));
  }

  if (!isOrderCancellable(order)) {
    return next(new AppError('This order can no longer be cancelled', 400));
  }

  order.status = 'cancelled';
  order.paymentStatus = 'refunded';
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  order.cancelledAt = new Date();
  order.tracking.currentStatus = 'cancelled';
  order.tracking.updates.push({
    status: 'cancelled',
    message: order.cancelReason,
    createdAt: new Date(),
  });
  await order.save();

  return res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: {
      order,
    },
  });
});

const getOrderInvoice = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name slug images brand category unit')
    .populate('user', 'name email phone avatar role');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const isOwner = String(order.user._id) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(new AppError('You do not have permission to view this invoice', 403));
  }

  return res.status(200).json({
    success: true,
    data: {
      invoice: {
        invoiceNumber: order.invoice.invoiceNumber,
        issuedAt: order.invoice.issuedAt,
        orderNumber: order.orderNumber,
        orderId: order._id,
        order,
      },
    },
  });
});

const updateOrderTracking = asyncHandler(async (req, res, next) => {
  const validationErrors = validateTrackingPayload(req.body);

  if (validationErrors.length > 0) {
    return next(new AppError(validationErrors.join(', '), 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const status = req.body.status.trim().toLowerCase();
  const message = req.body.message.trim();

  order.status = status;
  order.tracking.currentStatus = status;
  order.tracking.updates.push({
    status,
    message,
    createdAt: new Date(),
  });

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.paymentStatus = 'paid';
  }

  await order.save();

  return res.status(200).json({
    success: true,
    message: 'Order tracking updated successfully',
    data: {
      order,
    },
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('items.product', 'name slug images brand category unit')
    .populate('user', 'name email phone avatar role');

  return res.status(200).json({
    success: true,
    data: {
      orders,
    },
  });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrderInvoice,
  updateOrderTracking,
  getAllOrders,
};
