import { useState } from 'react';
import { FaBagShopping, FaTicket, FaTrashCan } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import CartLineItem from '../../components/cart/CartLineItem';
import { formatCurrency } from '../../utils/checkout';

function CartPage() {
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const {
    items,
    cartCount,
    subtotal,
    originalTotal,
    discountTotal,
    couponCode,
    couponDiscount,
    shippingFee,
    taxAmount,
    grandTotal,
    appliedCoupon,
    availableCoupons,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const handleCouponApply = (event) => {
    event.preventDefault();
    const result = applyCoupon(couponInput);
    setCouponMessage(result.message);

    if (result.success) {
      setCouponInput('');
    }
  };

  const handleCouponRemove = () => {
    removeCoupon();
    setCouponMessage('Coupon removed.');
  };

  if (!items.length) {
    return (
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-10 text-center shadow-soft">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-3xl text-brand-600">
          <FaBagShopping />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950">Your cart is empty</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Add fresh groceries from the product catalog to start building your order.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
        >
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">Shopping cart</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Review items before checkout</h1>
          <p className="text-base leading-7 text-slate-600">
            Quantity updates and totals are stored in localStorage, so the cart survives refreshes while we continue building the checkout flow.
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white px-5 py-4 shadow-soft">
          <p className="text-sm font-semibold text-slate-500">Items</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{cartCount}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <CartLineItem
              key={item.id}
              item={item}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        <aside className="space-y-4 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Order summary</p>
              <h2 className="text-2xl font-black text-slate-950">Totals</h2>
            </div>
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <FaTrashCan />
              Clear
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Items total</span>
              <span>{formatCurrency(originalTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Discount</span>
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
              <span>Subtotal</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
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
                {availableCoupons.map((coupon) => (
                  <div key={coupon.code} className="rounded-2xl bg-white px-4 py-3 text-xs text-slate-600">
                    <p className="font-semibold text-slate-900">{coupon.code}</p>
                    <p>{coupon.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </form>

          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Next up</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              We will add coupon validation, shipping charges, tax calculation, and checkout in the next step.
            </p>
          </div>

          <Link
            to="/checkout"
            className="block rounded-2xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
          >
            Proceed to checkout
          </Link>
          <Link
            to="/products"
            className="block rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default CartPage;
