const ORDER_RULES = {
  freeShippingThreshold: 999,
  shippingFee: 49,
  taxRate: 0.05,
};

const ORDER_COUPONS = [
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

const normalizeCouponCode = (value) => {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
};

const getCouponByCode = (couponCode) => {
  const normalizedCode = normalizeCouponCode(couponCode);
  return ORDER_COUPONS.find((coupon) => coupon.code === normalizedCode) || null;
};

const calculateCouponDiscount = (subtotal, coupon) => {
  const normalizedSubtotal = Math.max(Number(subtotal) || 0, 0);

  if (!coupon || normalizedSubtotal < coupon.minSubtotal) {
    return 0;
  }

  if (coupon.type === 'percentage') {
    const calculatedDiscount = Math.round((normalizedSubtotal * coupon.value) / 100);
    return Math.min(calculatedDiscount, coupon.maxDiscount || calculatedDiscount);
  }

  if (coupon.type === 'flat') {
    return Math.min(coupon.value, normalizedSubtotal);
  }

  return 0;
};

const calculateShippingFee = (amount) => {
  const normalizedAmount = Math.max(Number(amount) || 0, 0);
  return normalizedAmount >= ORDER_RULES.freeShippingThreshold ? 0 : ORDER_RULES.shippingFee;
};

const calculateTaxAmount = (amount) => {
  const normalizedAmount = Math.max(Number(amount) || 0, 0);
  return Math.round(normalizedAmount * ORDER_RULES.taxRate);
};

const calculateOrderTotals = ({ subtotal, couponCode }) => {
  const normalizedSubtotal = Math.max(Number(subtotal) || 0, 0);
  const appliedCoupon = getCouponByCode(couponCode);
  const couponDiscount = calculateCouponDiscount(normalizedSubtotal, appliedCoupon);
  const taxableAmount = Math.max(normalizedSubtotal - couponDiscount, 0);
  const shippingFee = calculateShippingFee(taxableAmount);
  const taxAmount = calculateTaxAmount(taxableAmount);
  const grandTotal = taxableAmount + shippingFee + taxAmount;

  return {
    subtotal: normalizedSubtotal,
    appliedCoupon,
    couponCode: appliedCoupon ? appliedCoupon.code : '',
    couponDiscount,
    taxableAmount,
    shippingFee,
    taxAmount,
    grandTotal,
  };
};

module.exports = {
  ORDER_RULES,
  ORDER_COUPONS,
  normalizeCouponCode,
  getCouponByCode,
  calculateCouponDiscount,
  calculateShippingFee,
  calculateTaxAmount,
  calculateOrderTotals,
};
