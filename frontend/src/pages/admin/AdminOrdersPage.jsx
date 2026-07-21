import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaRotateRight, FaMagnifyingGlass, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
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

  const { register, handleSubmit, reset, getValues } = useForm({
    defaultValues: { status: '', paymentStatus: '' },
  });

  const loadOrders = async (params = {}) => {
    setIsLoading(true);
    setMessage('');

    try {
      const currentValues = getValues();
      const queryParams = {
        page: params.page !== undefined ? params.page : pagination.page,
        limit: params.limit !== undefined ? params.limit : pagination.limit,
        status: params.status !== undefined ? params.status : currentValues.status,
        paymentStatus: params.paymentStatus !== undefined ? params.paymentStatus : currentValues.paymentStatus,
      };

      const response = await adminService.getOrders(queryParams);
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
    loadOrders({ page: 1, limit: 10 });
  }, []);

  const onSubmit = async (formValues) => {
    await loadOrders({ ...formValues, page: 1, limit: pagination.limit });
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    await loadOrders({ page: newPage });
  };

  const handleLimitChange = async (newLimit) => {
    await loadOrders({ page: 1, limit: Number(newLimit) });
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

      {/* Pagination Controls Bar */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between shadow-soft">
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <span>
            Showing <strong className="font-bold text-slate-900 dark:text-white">{pagination.totalOrders === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}</strong>–<strong className="font-bold text-slate-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.totalOrders)}</strong> of <strong className="font-bold text-slate-900 dark:text-white">{pagination.totalOrders}</strong> orders
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Show per page:</span>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500"
            >
              <option value="10">10 orders</option>
              <option value="20">20 orders</option>
              <option value="50">50 orders</option>
              <option value="100">100 orders (All)</option>
            </select>
          </div>
        </div>

        {/* Page navigation controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <FaChevronLeft className="text-[10px]" /> Prev
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2)
            .map((p, idx, arr) => {
              const prevPage = arr[idx - 1];
              const showEllipsis = prevPage && p - prevPage > 1;

              return (
                <span key={p} className="flex items-center gap-1">
                  {showEllipsis ? <span className="px-1 text-xs text-slate-400">...</span> : null}
                  <button
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={`h-8 w-8 rounded-xl text-xs font-bold transition ${
                      p === pagination.page
                        ? 'bg-indigo-600 text-white shadow-soft font-black'
                        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              );
            })}

          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages || isLoading}
            onClick={() => handlePageChange(pagination.page + 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Next <FaChevronRight className="text-[10px]" />
          </button>
        </div>
      </div>
    </AdminSectionShell>
  );
}

export default AdminOrdersPage;
