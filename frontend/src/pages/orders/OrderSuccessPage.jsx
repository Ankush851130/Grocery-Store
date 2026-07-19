import { Link, useLocation, Navigate } from 'react-router-dom';
import { FaClipboardList, FaFileInvoice, FaTruck } from 'react-icons/fa6';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function OrderSuccessPage() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/products" replace />;
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6 rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-soft">
      <div className="flex flex-col items-start gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-700">
          <FaClipboardList />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">Order placed</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Your order is confirmed</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          We have captured your checkout details and created an order record. The next phase will connect Razorpay and real payment status updates.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">Order number</p>
          <p className="mt-1 text-lg font-bold text-slate-950">{order.orderNumber}</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">Payment method</p>
          <p className="mt-1 text-lg font-bold text-slate-950">{order.paymentMethod.toUpperCase()}</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">Grand total</p>
          <p className="mt-1 text-lg font-bold text-slate-950">{currencyFormatter.format(order.pricing?.grandTotal || 0)}</p>
        </div>
      </div>

      <div className="rounded-[1.5rem] bg-slate-50 p-5">
        <div className="flex items-center gap-2">
          <FaTruck className="text-brand-600" />
          <h2 className="text-lg font-bold text-slate-950">Delivery status</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Current status: <span className="font-semibold text-slate-900">{order.status}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700"
        >
          <FaClipboardList />
          View My Orders
        </Link>
        <Link
          to="/products"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
        >
          Continue Shopping
        </Link>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
        >
          <FaFileInvoice />
          View Profile
        </Link>
      </div>
    </section>
  );
}

export default OrderSuccessPage;
