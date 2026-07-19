const crypto = require('crypto');
const Razorpay = require('razorpay');

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  const razorpay = getRazorpayClient();

  return razorpay.orders.create({
    amount: Math.round(Number(amount) || 0) * 100,
    currency: 'INR',
    receipt,
    payment_capture: 1,
    notes,
  });
};

const verifyRazorpaySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw new Error('Razorpay secret is not configured');
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};

module.exports = {
  getRazorpayClient,
  createRazorpayOrder,
  verifyRazorpaySignature,
};
