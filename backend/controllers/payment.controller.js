const Order = require('../models/order.model');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
} = require('../services/razorpay.service');
const {
  validateCreateRazorpayOrderPayload,
  validateVerifyRazorpayPaymentPayload,
} = require('../validators/payment.validators');

const isOrderOwnedByCurrentUser = (order, user) => {
  return String(order.user) === String(user._id) || user.role === 'admin';
};

const createGatewayOrder = asyncHandler(async (req, res, next) => {
  const validationErrors = validateCreateRazorpayOrderPayload(req.body);

  if (validationErrors.length > 0) {
    return next(new AppError(validationErrors.join(', '), 400));
  }

  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (!isOrderOwnedByCurrentUser(order, req.user)) {
    return next(new AppError('You do not have permission to access this order', 403));
  }

  if (order.paymentMethod !== 'razorpay') {
    return next(new AppError('This order was not created for Razorpay payment', 400));
  }

  if (order.paymentStatus === 'paid') {
    return next(new AppError('This order is already paid', 400));
  }

  const gatewayOrder = await createRazorpayOrder({
    amount: order.pricing.grandTotal,
    receipt: order.orderNumber,
    notes: {
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      userId: String(req.user._id),
    },
  });

  order.paymentResult.provider = 'razorpay';
  order.paymentResult.razorpayOrderId = gatewayOrder.id;
  order.paymentResult.razorpayPaymentId = '';
  order.paymentResult.razorpaySignature = '';
  await order.save();

  return res.status(200).json({
    success: true,
    message: 'Razorpay order created successfully',
    data: {
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        amount: order.pricing.grandTotal,
        currency: 'INR',
        razorpayOrderId: gatewayOrder.id,
        receipt: gatewayOrder.receipt,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    },
  });
});

const verifyPayment = asyncHandler(async (req, res, next) => {
  const validationErrors = validateVerifyRazorpayPaymentPayload(req.body);

  if (validationErrors.length > 0) {
    return next(new AppError(validationErrors.join(', '), 400));
  }

  const {
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;

  const order = await Order.findById(orderId)
    .populate('user', 'name email phone avatar role')
    .populate('items.product', 'name slug images brand category unit');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (!isOrderOwnedByCurrentUser(order, req.user)) {
    return next(new AppError('You do not have permission to verify this order', 403));
  }

  if (order.paymentMethod !== 'razorpay') {
    return next(new AppError('This order was not created for Razorpay payment', 400));
  }

  const isSignatureValid = verifyRazorpaySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  if (!isSignatureValid) {
    return next(new AppError('Payment verification failed', 400));
  }

  order.paymentStatus = 'paid';
  order.status = 'confirmed';
  order.paymentResult.provider = 'razorpay';
  order.paymentResult.razorpayOrderId = razorpayOrderId;
  order.paymentResult.razorpayPaymentId = razorpayPaymentId;
  order.paymentResult.razorpaySignature = razorpaySignature;
  order.paymentResult.paidAt = new Date();
  order.tracking.currentStatus = 'confirmed';
  order.tracking.updates.push({
    status: 'confirmed',
    message: 'Payment received successfully',
    createdAt: new Date(),
  });
  await order.save();

  return res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    data: {
      order,
    },
  });
});

const getPaymentKey = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      keyId: process.env.RAZORPAY_KEY_ID || '',
    },
  });
});

module.exports = {
  createGatewayOrder,
  verifyPayment,
  getPaymentKey,
};
