export const CHECKOUT_RULES = {
  freeShippingThreshold: 999,
  shippingFee: 49,
  taxRate: 0.05,
};

export const AVAILABLE_COUPONS = [
  {
    code: 'FRESH10',
    label: '10% off on orders above ₹999',
    type: 'percentage',
    value: 10,
    minSubtotal: 999,
    maxDiscount: 200,
  },
  {
    code: 'GROCERY150',
    label: 'Flat ₹150 off on orders above ₹2000',
    type: 'flat',
    value: 150,
    minSubtotal: 2000,
    maxDiscount: 150,
  },
  {
    code: 'SAVE5',
    label: '5% off on orders above ₹3000',
    type: 'percentage',
    value: 5,
    minSubtotal: 3000,
    maxDiscount: 300,
  },
];

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(Number(amount) || 0));
};

export const normalizeCouponCode = (code) => {
  return typeof code === 'string' ? code.trim().toUpperCase() : '';
};

export const getCouponByCode = (code) => {
  const normalizedCode = normalizeCouponCode(code);
  return AVAILABLE_COUPONS.find((coupon) => coupon.code === normalizedCode) || null;
};

export const calculateCouponDiscount = (subtotal, coupon) => {
  const normalizedSubtotal = Math.max(Number(subtotal) || 0, 0);

  if (!coupon || normalizedSubtotal < coupon.minSubtotal) {
    return 0;
  }

  if (coupon.type === 'percentage') {
    const computedDiscount = Math.round((normalizedSubtotal * coupon.value) / 100);
    return Math.min(computedDiscount, coupon.maxDiscount || computedDiscount);
  }

  if (coupon.type === 'flat') {
    return Math.min(coupon.value, normalizedSubtotal);
  }

  return 0;
};

export const calculateShippingFee = (amount) => {
  const normalizedAmount = Math.max(Number(amount) || 0, 0);
  return normalizedAmount >= CHECKOUT_RULES.freeShippingThreshold ? 0 : CHECKOUT_RULES.shippingFee;
};

export const calculateTaxAmount = (amount) => {
  const normalizedAmount = Math.max(Number(amount) || 0, 0);
  return Math.round(normalizedAmount * CHECKOUT_RULES.taxRate);
};

export const calculateCheckoutTotals = ({ subtotal, couponCode }) => {
  const normalizedSubtotal = Math.max(Number(subtotal) || 0, 0);
  const appliedCoupon = getCouponByCode(couponCode);
  const couponDiscount = calculateCouponDiscount(normalizedSubtotal, appliedCoupon);
  const taxableAmount = Math.max(normalizedSubtotal - couponDiscount, 0);
  const shippingFee = calculateShippingFee(taxableAmount);
  const taxAmount = calculateTaxAmount(taxableAmount);
  const grandTotal = taxableAmount + shippingFee + taxAmount;

  return {
    subtotal: normalizedSubtotal,
    couponCode: appliedCoupon ? appliedCoupon.code : '',
    appliedCoupon,
    couponDiscount,
    taxableAmount,
    shippingFee,
    taxAmount,
    grandTotal,
  };
};
