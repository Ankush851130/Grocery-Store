const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

const validateCreateRazorpayOrderPayload = (payload) => {
  const errors = [];

  if (!isNonEmptyString(payload.orderId)) {
    errors.push('orderId is required');
  }

  return errors;
};

const validateVerifyRazorpayPaymentPayload = (payload) => {
  const errors = [];

  if (!isNonEmptyString(payload.orderId)) {
    errors.push('orderId is required');
  }

  if (!isNonEmptyString(payload.razorpayOrderId)) {
    errors.push('razorpayOrderId is required');
  }

  if (!isNonEmptyString(payload.razorpayPaymentId)) {
    errors.push('razorpayPaymentId is required');
  }

  if (!isNonEmptyString(payload.razorpaySignature)) {
    errors.push('razorpaySignature is required');
  }

  return errors;
};

module.exports = {
  validateCreateRazorpayOrderPayload,
  validateVerifyRazorpayPaymentPayload,
};
