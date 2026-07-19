import { NavLink, Outlet } from 'react-router-dom';
import { FaBoxesStacked, FaChartLine, FaHouse, FaUsers, FaBagShopping } from 'react-icons/fa6';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
    isActive
      ? 'bg-brand-600 text-white shadow-soft'
      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
  }`;

function AdminLayout() {
  return (
    <div className="grid min-h-[calc(100vh-88px)] gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-[2rem] border border-white/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-4 shadow-soft backdrop-blur lg:sticky lg:top-28 lg:h-fit">
        <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Admin panel</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">Management center</h1>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Monitor analytics and manage users, catalog, and orders from one place.
          </p>
        </div>

        <nav className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:space-y-2">
          <NavLink to="/admin" end className={navLinkClass}>
            <FaChartLine />
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={navLinkClass}>
            <FaUsers />
            Users
          </NavLink>
          <NavLink to="/admin/products" className={navLinkClass}>
            <FaBoxesStacked />
            Products
          </NavLink>
          <NavLink to="/admin/orders" className={navLinkClass}>
            <FaBagShopping />
            Orders
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            <FaHouse />
            Back to store
          </NavLink>
        </nav>
      </aside>

      <main className="space-y-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
