import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FaAddressCard,
  FaArrowLeft,
  FaCreditCard,
  FaLocationDot,
  FaPlus,
  FaTicket,
  FaWallet,
} from 'react-icons/fa6';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import { LOCAL_STORAGE_KEYS } from '../../utils/constants';
import { AVAILABLE_COUPONS, formatCurrency } from '../../utils/checkout';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';
import loadScript from '../../utils/loadScript';

const ADDRESS_STORAGE_KEY = LOCAL_STORAGE_KEYS.checkoutAddresses;
const SELECTED_ADDRESS_STORAGE_KEY = LOCAL_STORAGE_KEYS.checkoutSelectedAddressId;

const seedAddresses = [
  {
    id: 'home-address',
    label: 'Home',
    name: 'Primary Address',
    phone: '9999999999',
    line1: '123, Green Park Road',
    line2: 'Near Central Market',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    landmark: 'Central Market',
    isDefault: true,
  },
];

const getStoredAddresses = () => {
  if (typeof window === 'undefined') {
    return seedAddresses;
  }

  try {
    const storedAddresses = JSON.parse(window.localStorage.getItem(ADDRESS_STORAGE_KEY) || 'null');
    if (Array.isArray(storedAddresses) && storedAddresses.length > 0) {
      return storedAddresses;
    }
  } catch (error) {
    return seedAddresses;
  }

  return seedAddresses;
};

const getStoredSelectedAddressId = (addresses) => {
  if (typeof window === 'undefined') {
    return addresses.find((address) => address.isDefault)?.id || addresses[0]?.id || '';
  }

  const storedSelectedId = window.localStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);

  if (storedSelectedId && addresses.some((address) => address.id === storedSelectedId)) {
    return storedSelectedId;
  }

  return addresses.find((address) => address.isDefault)?.id || addresses[0]?.id || '';
};

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    subtotal,
    discountTotal,
    couponCode,
    appliedCoupon,
    couponDiscount,
    shippingFee,
    taxAmount,
    grandTotal,
    applyCoupon,
    removeCoupon,
    availableCoupons,
    clearCart,
  } = useCart();
  const [couponInput, setCouponInput] = useState(couponCode || '');
  const [couponMessage, setCouponMessage] = useState('');
  const [addresses, setAddresses] = useState(getStoredAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(() => getStoredSelectedAddressId(getStoredAddresses()));
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      label: 'Home',
      name: user?.name || '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
    },
  });

  useEffect(() => {
    window.localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    window.localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, selectedAddressId);
  }, [selectedAddressId]);

  const selectedAddress = useMemo(() => {
    return addresses.find((address) => address.id === selectedAddressId) || addresses[0] || null;
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (!selectedAddressId && addresses[0]?.id) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const handleCouponApply = (event) => {
    event.preventDefault();
    const result = applyCoupon(couponInput);
    setCouponMessage(result.message);

    if (result.success) {
      setCouponInput(result.coupon.code);
    }
  };

  const handleCouponRemove = () => {
    removeCoupon();
    setCouponMessage('Coupon removed.');
    setCouponInput('');
  };

  const handleSaveAddress = async (formValues) => {
    setIsSavingAddress(true);

    const newAddress = {
      id: `address-${Date.now()}`,
      label: formValues.label,
      name: formValues.name,
      phone: formValues.phone,
      line1: formValues.line1,
      line2: formValues.line2,
      city: formValues.city,
      state: formValues.state,
      pincode: formValues.pincode,
      landmark: formValues.landmark,
      isDefault: addresses.length === 0,
    };

    setAddresses((currentAddresses) => [newAddress, ...currentAddresses]);
    setSelectedAddressId(newAddress.id);
    reset({
      label: 'Home',
      name: user?.name || '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
    });
    setSubmissionMessage('Address saved successfully.');
    setIsSavingAddress(false);
  };

  const handleContinueToPayment = () => {
    setSubmissionMessage('Payment integration will be connected in the next phase.');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setSubmissionMessage('Please select a delivery address before placing the order.');
      return;
    }

    setIsPlacingOrder(true);
    setSubmissionMessage('');

    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: selectedAddress,
        paymentMethod: selectedPaymentMethod,
        couponCode: couponCode ? couponCode : undefined,
        notes: 'Checkout placed from the frontend checkout screen.',
      };

      const response = await orderService.placeOrder(payload);
      const createdOrder = response.data?.data?.order;

      if (!createdOrder) {
        throw new Error('Unable to create order');
      }

      if (selectedPaymentMethod === 'cod') {
        clearCart();
        navigate('/orders/success', { state: { order: createdOrder }, replace: true });
        return;
      }

      const paymentOrderResponse = await paymentService.createRazorpayOrder({
        orderId: createdOrder._id,
      });

      const paymentOrder = paymentOrderResponse.data?.data?.order;

      if (!paymentOrder?.keyId || !paymentOrder?.razorpayOrderId) {
        throw new Error('Unable to initialize Razorpay checkout');
      }

      const isScriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      if (!isScriptLoaded) {
        throw new Error('Razorpay checkout failed to load');
      }

      const razorpayOptions = {
        key: paymentOrder.keyId,
        amount: paymentOrder.amount * 100,
        currency: paymentOrder.currency,
        name: 'Grocery E-Commerce',
        description: 'Complete your grocery order payment',
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: selectedAddress.phone || '',
        },
        theme: {
          color: '#ea580c',
        },
        handler: async (responsePayload) => {
          try {
            const verificationResponse = await paymentService.verifyRazorpayPayment({
              orderId: createdOrder._id,
              razorpayOrderId: responsePayload.razorpay_order_id,
              razorpayPaymentId: responsePayload.razorpay_payment_id,
              razorpaySignature: responsePayload.razorpay_signature,
            });

            const verifiedOrder = verificationResponse.data?.data?.order;

            if (!verifiedOrder) {
              throw new Error('Unable to verify payment');
            }

            clearCart();
            navigate('/orders/success', { state: { order: verifiedOrder }, replace: true });
          } catch (verificationError) {
            setSubmissionMessage(
              verificationError?.response?.data?.message || 'Payment was captured, but verification failed.',
            );
          }
        },
        modal: {
          ondismiss: () => {
            setSubmissionMessage('Payment window closed. You can try again from checkout.');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(razorpayOptions);
      razorpayInstance.open();
    } catch (requestError) {
      setSubmissionMessage(
        requestError?.response?.data?.message || 'We could not place the order right now. Please try again.',
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!items.length) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
          >
            <FaArrowLeft />
            Back to cart
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">Checkout</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Choose address and review payment</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            This checkout step handles address selection, coupon usage, shipping charges, tax calculation, and the final payable amount before payment integration.
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white px-5 py-4 shadow-soft">
          <p className="text-sm font-semibold text-slate-500">Payable</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{formatCurrency(grandTotal)}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <FaAddressCard />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Saved addresses</h2>
                <p className="text-sm text-slate-500">Select a delivery address or add a new one.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`block cursor-pointer rounded-[1.5rem] border p-4 transition ${
                    selectedAddressId === address.id
                      ? 'border-brand-300 bg-brand-50/70'
                      : 'border-slate-200 bg-white hover:border-brand-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1 h-4 w-4 accent-brand-600"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-500">{address.label}</p>
                        {address.isDefault ? (
                          <span className="rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-1 text-base font-bold text-slate-950">{address.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">Phone: {address.phone}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <FaPlus />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Add a new address</h2>
                <p className="text-sm text-slate-500">Store multiple delivery addresses locally for now.</p>
              </div>
            </div>

            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(handleSaveAddress)}>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Label</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  {...register('label', { required: 'Label is required' })}
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
                {errors.label ? <p className="text-sm font-medium text-red-600">{errors.label.message}</p> : null}
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Full name</span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name ? <p className="text-sm font-medium text-red-600">{errors.name.message}</p> : null}
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Phone</span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  {...register('phone', {
                    required: 'Phone is required',
                    minLength: { value: 10, message: 'Enter a valid phone number' },
                  })}
                />
                {errors.phone ? <p className="text-sm font-medium text-red-600">{errors.phone.message}</p> : null}
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Address line 1</span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  {...register('line1', { required: 'Address line 1 is required' })}
                />
                {errors.line1 ? <p className="text-sm font-medium text-red-600">{errors.line1.message}</p> : null}
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Address line 2</span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  {...register('line2')}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">City</span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  {...register('city', { required: 'City is required' })}
                />
                {errors.city ? <p className="text-sm font-medium text-red-600">{errors.city.message}</p> : null}
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">State</span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  {...register('state', { required: 'State is required' })}
                />
                {errors.state ? <p className="text-sm font-medium text-red-600">{errors.state.message}</p> : null}
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Pincode</span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  {...register('pincode', { required: 'Pincode is required' })}
                />
                {errors.pincode ? <p className="text-sm font-medium text-red-600">{errors.pincode.message}</p> : null}
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Landmark</span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  {...register('landmark')}
                />
              </label>
              <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isSavingAddress}
                  className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingAddress ? 'Saving...' : 'Save address'}
                </button>
              </div>
            </form>
          </section>
        </div>

        <aside className="space-y-4 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <FaWallet />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Payment summary</p>
              <h2 className="text-2xl font-black text-slate-950">Order totals</h2>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Items total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Item discount</span>
              <span>- {formatCurrency(discountTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Coupon</span>
              <span>- {formatCurrency(couponDiscount)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Tax</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base font-semibold text-slate-900">
              <span>Grand total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Applied coupon</p>
            <p className="mt-1 text-lg font-bold text-slate-950">{appliedCoupon?.code || 'None'}</p>
            <p className="mt-1 text-sm text-slate-600">
              {appliedCoupon ? appliedCoupon.label : 'Apply a coupon from the cart or checkout section.'}
            </p>
          </div>

          <form className="space-y-3 rounded-[1.5rem] bg-slate-50 p-4" onSubmit={handleCouponApply}>
            <div className="flex items-center gap-2">
              <FaTicket className="text-brand-600" />
              <p className="text-sm font-semibold text-slate-500">Coupon support</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value)}
                placeholder="FRESH10"
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
              <button
                type="submit"
                className="rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Apply
              </button>
            </div>
            {couponCode ? (
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm">
                <span className="font-semibold text-slate-700">{appliedCoupon?.code} applied</span>
                <button
                  type="button"
                  onClick={handleCouponRemove}
                  className="font-semibold text-red-600 transition hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : null}
            {couponMessage ? <p className="text-sm text-slate-500">{couponMessage}</p> : null}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Available coupons</p>
              <div className="space-y-2">
                {AVAILABLE_COUPONS.map((coupon) => (
                  <div key={coupon.code} className="rounded-2xl bg-white px-4 py-3 text-xs text-slate-600">
                    <p className="font-semibold text-slate-900">{coupon.code}</p>
                    <p>{coupon.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </form>

          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Selected delivery address</p>
            {selectedAddress ? (
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{selectedAddress.label} · {selectedAddress.name}</p>
                <p>{selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}</p>
                <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                <p>{selectedAddress.phone}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">No address selected.</p>
            )}
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FaCreditCard className="text-brand-600 text-lg" />
              <p className="text-sm font-bold text-slate-900">Select Payment Method</p>
            </div>

            <div className="space-y-2.5">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  selectedPaymentMethod === 'cod'
                    ? 'border-brand-500 bg-brand-50/80 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-brand-200'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={selectedPaymentMethod === 'cod'}
                  onChange={() => setSelectedPaymentMethod('cod')}
                  className="mt-1 h-4 w-4 accent-brand-600"
                />
                <div className="flex-1 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-950">💵 Cash on Delivery (COD)</p>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      Recommended
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Pay in cash or via UPI Scanner to our delivery partner when your order arrives.
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  selectedPaymentMethod === 'razorpay'
                    ? 'border-brand-500 bg-brand-50/80 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-brand-200'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={selectedPaymentMethod === 'razorpay'}
                  onChange={() => setSelectedPaymentMethod('razorpay')}
                  className="mt-1 h-4 w-4 accent-brand-600"
                />
                <div className="flex-1 text-sm">
                  <p className="font-bold text-slate-950">💳 Online Payment (Razorpay)</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Pay securely using Cards, UPI Apps (GPay, PhonePe, Paytm), or NetBanking.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={!selectedAddress || isPlacingOrder}
            className="w-full rounded-2xl bg-brand-600 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-brand-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPlacingOrder
              ? 'Placing Order...'
              : selectedPaymentMethod === 'cod'
              ? `Place Order with Cash on Delivery (${formatCurrency(grandTotal)})`
              : `Pay ${formatCurrency(grandTotal)} via Razorpay`}
          </button>

          {submissionMessage ? (
            <div className="rounded-[1.5rem] border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
              {submissionMessage}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;
