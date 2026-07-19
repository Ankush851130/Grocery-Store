const isNonEmptyString = (value, minLength = 1) => {
  return typeof value === 'string' && value.trim().length >= minLength;
};

const isPositiveInteger = (value) => {
  const numericValue = Number(value);
  return Number.isInteger(numericValue) && numericValue > 0;
};

const validateAddress = (address) => {
  const errors = [];
  const requiredFields = ['label', 'name', 'phone', 'line1', 'city', 'state', 'pincode'];

  if (!address || typeof address !== 'object') {
    return ['shippingAddress is required'];
  }

  requiredFields.forEach((field) => {
    if (!isNonEmptyString(address[field])) {
      errors.push(`shippingAddress.${field} is required`);
    }
  });

  return errors;
};

const validatePlaceOrderPayload = (payload) => {
  const errors = [];

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push('items must be a non-empty array');
  } else {
    payload.items.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`items[${index}] must be an object`);
        return;
      }

      if (!isNonEmptyString(item.productId)) {
        errors.push(`items[${index}].productId is required`);
      }

      if (!isPositiveInteger(item.quantity)) {
        errors.push(`items[${index}].quantity must be a positive integer`);
      }
    });
  }

  errors.push(...validateAddress(payload.shippingAddress));

  if (!['cod', 'razorpay'].includes(payload.paymentMethod)) {
    errors.push('paymentMethod must be either cod or razorpay');
  }

  if (
    payload.couponCode !== undefined &&
    payload.couponCode !== null &&
    typeof payload.couponCode === 'string' &&
    payload.couponCode.trim().length > 0 &&
    !isNonEmptyString(payload.couponCode)
  ) {
    errors.push('couponCode must be a non-empty string when provided');
  }

  if (payload.notes !== undefined && payload.notes !== null && typeof payload.notes !== 'string') {
    errors.push('notes must be a string when provided');
  }

  return errors;
};

const validateCancelPayload = (payload) => {
  const errors = [];

  if (payload.reason !== undefined && payload.reason !== null && !isNonEmptyString(payload.reason)) {
    errors.push('reason must be a non-empty string when provided');
  }

  return errors;
};

const validateTrackingPayload = (payload) => {
  const errors = [];

  if (!isNonEmptyString(payload.status)) {
    errors.push('status is required');
  }

  if (!isNonEmptyString(payload.message)) {
    errors.push('message is required');
  }

  return errors;
};

module.exports = {
  validatePlaceOrderPayload,
  validateCancelPayload,
  validateTrackingPayload,
};
