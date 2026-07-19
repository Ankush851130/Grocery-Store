import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaRotateRight, FaMagnifyingGlass } from 'react-icons/fa6';
import adminService from '../../services/adminService';
import orderService from '../../services/orderService';
import AdminSectionShell from '../../components/admin/AdminSectionShell';
import AdminBadge from '../../components/admin/AdminBadge';
import { formatCurrency } from '../../utils/checkout';

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalOrders: 0, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { status: '', paymentStatus: '' },
  });

  const loadOrders = async (params = {}) => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await adminService.getOrders(params);
      const responseData = response.data?.data || {};
      setOrders(responseData.orders || []);
      setPagination(responseData.pagination || pagination);
    } catch (error) {
      setMessage('Unable to load admin orders right now.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const onSubmit = async (formValues) => {
    await loadOrders({ status: formValues.status, paymentStatus: formValues.paymentStatus, page: 1 });
  };

  const handleReset = async () => {
    reset({ status: '', paymentStatus: '' });
    await loadOrders({ page: 1 });
  };

  const handleSetStatus = async (order, status, messageText) => {
    await orderService.updateOrderTracking(order._id, {
      status,
      message: messageText,
    });
    await loadOrders({ page: pagination.page });
    setMessage('Order status updated successfully.');
  };

  return (
    <AdminSectionShell
      title="Manage orders"
      description="Review checkout records, filter by state, and push tracking updates for customer orders."
      actions={
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
        >
          <FaRotateRight />
          Reset
        </button>
      }
    >
      <form className="grid gap-4 md:grid-cols-[1fr_220px_220px_auto]" onSubmit={handleSubmit(onSubmit)}>
        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Search status</span>
          <div className="relative">
            <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="pending, confirmed, shipped..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              {...register('status')}
            />
          </div>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Payment</span>
          <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" {...register('paymentStatus')}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 xl:self-end"
        >
          Filter orders
        </button>
      </form>

      {message ? <div className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div> : null}

      <div className="mt-5 space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">{order.orderNumber}</p>
                <h3 className="mt-1 text-lg font-bold text-slate-950">{order.user?.name || 'Customer'}</h3>
                <p className="text-sm text-slate-500">{order.user?.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AdminBadge tone={order.status === 'cancelled' ? 'danger' : 'brand'}>{order.status}</AdminBadge>
                <AdminBadge tone={order.paymentStatus === 'paid' ? 'success' : 'warning'}>{order.paymentStatus}</AdminBadge>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Total</p>
                <p className="mt-1 text-xl font-black text-slate-950">{formatCurrency(order.pricing?.grandTotal || 0)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Items</p>
                <p className="mt-1 text-xl font-black text-slate-950">{order.items?.length || 0}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Method</p>
                <p className="mt-1 text-xl font-black text-slate-950">{order.paymentMethod.toUpperCase()}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSetStatus(order, 'processing', 'Order moved to processing by admin')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
              >
                Mark processing
              </button>
              <button
                type="button"
                onClick={() => handleSetStatus(order, 'shipped', 'Order shipped by admin')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
              >
                Mark shipped
              </button>
              <button
                type="button"
                onClick={() => handleSetStatus(order, 'delivered', 'Order delivered by admin')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
              >
                Mark delivered
              </button>
            </div>
          </div>
        ))}
        {!isLoading && !orders.length ? <p className="text-sm text-slate-500">No orders found.</p> : null}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <span>Total orders: {pagination.totalOrders}</span>
      </div>
    </AdminSectionShell>
  );
}

export default AdminOrdersPage;
