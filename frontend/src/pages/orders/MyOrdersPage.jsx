import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBagShopping,
  FaBoxOpen,
  FaCalendarDays,
  FaClock,
  FaCreditCard,
  FaLocationDot,
  FaReceipt,
  FaRotateRight,
  FaTruck,
  FaXmark,
} from 'react-icons/fa6';
import orderService from '../../services/orderService';
import { formatCurrency } from '../../utils/checkout';

const getStatusBadgeTone = (status) => {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'shipped':
    case 'processing':
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-amber-100 text-amber-800 border-amber-200';
  }
};

const getPaymentBadgeTone = (status) => {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'refunded':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-amber-100 text-amber-800 border-amber-200';
  }
};

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const fetchMyOrders = async () => {
    setIsLoading(true);
    try {
      const response = await orderService.getMyOrders();
      setOrders(response.data?.data?.orders || []);
    } catch (error) {
      setMessage('Failed to load your orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      await orderService.cancelOrder(orderId, { reason: cancelReason || 'Cancelled by customer' });
      setMessage('Order cancelled successfully.');
      setCancellingOrderId(null);
      setCancelReason('');
      await fetchMyOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to cancel this order.');
    }
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">Purchase History</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">My Orders</h1>
          <p className="mt-1 text-base leading-7 text-slate-600">
            Track live deliveries, view invoices, or cancel pending orders.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchMyOrders}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-soft transition hover:border-brand-200 hover:text-brand-700"
        >
          <FaRotateRight />
          Refresh Orders
        </button>
      </div>

      {message ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">
          {message}
        </div>
      ) : null}

      {/* Invoice Modal */}
      {selectedInvoiceOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Order Invoice</p>
                <h3 className="text-xl font-black text-slate-950">{selectedInvoiceOrder.orderNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceOrder(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <FaXmark className="text-lg" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500 font-semibold uppercase">Date Placed</p>
                <p className="mt-1 font-bold text-slate-900">
                  {new Date(selectedInvoiceOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500 font-semibold uppercase">Payment Method</p>
                <p className="mt-1 font-bold text-slate-900 uppercase">
                  {selectedInvoiceOrder.paymentMethod} ({selectedInvoiceOrder.paymentStatus})
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-3">Items Summary</h4>
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
                {selectedInvoiceOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 text-sm bg-white">
                    <div>
                      <p className="font-bold text-slate-900">{item.productName || item.product?.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} x {formatCurrency(item.unitPrice)} ({item.unit})
                      </p>
                    </div>
                    <p className="font-extrabold text-slate-950">{formatCurrency(item.lineTotal)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span>{formatCurrency(selectedInvoiceOrder.pricing?.itemsTotal)}</span>
              </div>
              {selectedInvoiceOrder.pricing?.couponDiscount > 0 ? (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({selectedInvoiceOrder.pricing?.couponCode})</span>
                  <span>- {formatCurrency(selectedInvoiceOrder.pricing?.couponDiscount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span>{formatCurrency(selectedInvoiceOrder.pricing?.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span>{formatCurrency(selectedInvoiceOrder.pricing?.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-950 pt-2 border-t">
                <span>Grand Total</span>
                <span>{formatCurrency(selectedInvoiceOrder.pricing?.grandTotal)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Cancel Reason Modal */}
      {cancellingOrderId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-950">Cancel Order</h3>
            <p className="text-sm text-slate-600">Please provide a reason for cancelling this order:</p>

            <textarea
              rows="3"
              placeholder="Reason for cancellation (optional)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-brand-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCancellingOrderId(null);
                  setCancelReason('');
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={() => handleCancelOrder(cancellingOrderId)}
                className="rounded-2xl bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 w-full animate-pulse rounded-[2rem] bg-slate-200/60" />
          ))}
        </div>
      ) : null}

      {/* Empty State */}
      {!isLoading && orders.length === 0 ? (
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-12 text-center shadow-soft space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-3xl text-brand-600">
            <FaBoxOpen />
          </div>
          <h3 className="text-2xl font-black text-slate-950">No orders found</h3>
          <p className="max-w-md mx-auto text-sm text-slate-500 leading-relaxed">
            You haven't placed any grocery orders yet. Explore our catalog and get farm-fresh produce delivered!
          </p>
          <div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700"
            >
              <FaBagShopping />
              <span>Explore Products</span>
            </Link>
          </div>
        </div>
      ) : null}

      {/* Orders List */}
      {!isLoading && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status);
            return (
              <article
                key={order._id}
                className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-soft transition hover:shadow-md"
              >
                {/* Order Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-bold text-slate-950">{order.orderNumber}</span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <FaCalendarDays className="text-slate-400" />
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusBadgeTone(
                        order.status
                      )}`}
                    >
                      <FaTruck className="text-[10px]" />
                      {order.status}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold uppercase ${getPaymentBadgeTone(
                        order.paymentStatus
                      )}`}
                    >
                      <FaCreditCard className="text-[10px]" />
                      {order.paymentMethod} · {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items & Details */}
                <div className="p-6 space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3"
                      >
                        <img
                          src={
                            item.image ||
                            item.product?.images?.[0] ||
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={item.productName}
                          className="h-14 w-14 shrink-0 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {item.productName || item.product?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Qty: {item.quantity} · {item.unit || '1 pc'}
                          </p>
                          <p className="text-xs font-bold text-slate-950 mt-0.5">
                            {formatCurrency(item.lineTotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address & Summary */}
                  <div className="flex flex-wrap items-center justify-between gap-6 border-t border-slate-100 pt-4 text-sm">
                    <div className="flex items-start gap-2 max-w-md">
                      <FaLocationDot className="mt-0.5 text-brand-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">
                          Shipping Address: {order.shippingAddress?.name} ({order.shippingAddress?.label})
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500">Grand Total</p>
                      <p className="text-2xl font-black text-slate-950">
                        {formatCurrency(order.pricing?.grandTotal || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                    >
                      <FaReceipt />
                      View Invoice
                    </button>

                    {canCancel ? (
                      <button
                        type="button"
                        onClick={() => setCancellingOrderId(order._id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
                      >
                        Cancel Order
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export default MyOrdersPage;
