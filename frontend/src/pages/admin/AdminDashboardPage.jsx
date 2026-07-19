import { useEffect, useState } from 'react';
import { FaBagShopping, FaBoxOpen, FaChartLine, FaUsers } from 'react-icons/fa6';
import adminService from '../../services/adminService';
import AdminSectionShell from '../../components/admin/AdminSectionShell';
import AdminBadge from '../../components/admin/AdminBadge';
import { formatCurrency } from '../../utils/checkout';

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-[1.5rem] bg-slate-50 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <Icon />
        </div>
      </div>
      {hint ? <p className="mt-3 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await adminService.getDashboardStats();
        const responseData = response.data?.data || {};

        if (!isActive) {
          return;
        }

        setStats(responseData.stats || null);
        setRecentUsers(responseData.recentUsers || []);
        setRecentProducts(responseData.recentProducts || []);
        setRecentOrders(responseData.recentOrders || []);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError('Unable to load admin dashboard data right now.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      <AdminSectionShell
        title="Dashboard analytics"
        description="Track store growth, product inventory, and order performance from the admin control plane."
      >
        {error ? (
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={FaUsers} label="Users" value={stats?.userCount ?? (isLoading ? '...' : 0)} hint="Total registered customers" />
          <StatCard icon={FaBoxOpen} label="Products" value={stats?.productCount ?? (isLoading ? '...' : 0)} hint="Catalog items in the system" />
          <StatCard icon={FaBagShopping} label="Orders" value={stats?.orderCount ?? (isLoading ? '...' : 0)} hint="Placed orders across the store" />
          <StatCard icon={FaChartLine} label="Revenue" value={formatCurrency(stats?.totalRevenue || 0)} hint="Paid order revenue" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Paid orders</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{stats?.paidOrders ?? 0}</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Cancelled orders</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{stats?.cancelledOrders ?? 0}</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Admin access</p>
            <AdminBadge tone="brand">Restricted</AdminBadge>
          </div>
        </div>
      </AdminSectionShell>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminSectionShell title="Recent users" description="Latest registrations and role assignments.">
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user._id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <AdminBadge tone={user.role === 'admin' ? 'success' : 'neutral'}>{user.role}</AdminBadge>
                </div>
              </div>
            ))}
            {!recentUsers.length ? <p className="text-sm text-slate-500">No user data yet.</p> : null}
          </div>
        </AdminSectionShell>

        <AdminSectionShell title="Recent products" description="Newest catalog additions and publishing state.">
          <div className="space-y-3">
            {recentProducts.map((product) => (
              <div key={product._id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.brand} · {product.category}</p>
                  </div>
                  <AdminBadge tone={product.isPublished ? 'success' : 'warning'}>
                    {product.isPublished ? 'Published' : 'Draft'}
                  </AdminBadge>
                </div>
              </div>
            ))}
            {!recentProducts.length ? <p className="text-sm text-slate-500">No product data yet.</p> : null}
          </div>
        </AdminSectionShell>

        <AdminSectionShell title="Recent orders" description="Most recent checkout events with payment state.">
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{order.orderNumber}</p>
                    <p className="text-sm text-slate-500">{order.user?.name || 'Unknown customer'}</p>
                  </div>
                  <AdminBadge tone={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                    {order.paymentStatus}
                  </AdminBadge>
                </div>
              </div>
            ))}
            {!recentOrders.length ? <p className="text-sm text-slate-500">No order data yet.</p> : null}
          </div>
        </AdminSectionShell>
      </div>
    </>
  );
}

export default AdminDashboardPage;
