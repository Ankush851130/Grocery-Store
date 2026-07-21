import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  FaBagShopping,
  FaBars,
  FaBolt,
  FaBoxesStacked,
  FaClipboardList,
  FaHouse,
  FaRightFromBracket,
  FaRightToBracket,
  FaUser,
  FaUserPlus,
  FaXmark,
} from 'react-icons/fa6';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import ThemeToggle from '../components/common/ThemeToggle';

function MainLayout() {
  const { user, logout, isLoading } = useAuth();
  const { cartCount, clearCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    closeMobileMenu();
    clearCart();
    await logout();
  };

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? 'bg-brand-600 text-white shadow-soft'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold transition ${
      isActive
        ? 'bg-brand-600 text-white shadow-soft'
        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <header className="sticky top-0 z-30 border-b border-white/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex w-full max-w-[1536px] items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" onClick={closeMobileMenu} className="group flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 text-slate-950 shadow-md shadow-amber-500/20 transition duration-300 group-hover:scale-105 group-hover:shadow-amber-500/40">
              <FaBolt className="text-xl text-slate-950 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-slate-950 via-slate-800 to-indigo-950 dark:from-white dark:via-slate-100 dark:to-amber-300 bg-clip-text text-transparent sm:text-xl">
                  QuickKart
                </span>
                <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-sm">
                  Superstore
                </span>
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                10-Minute Express Delivery
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <nav className="flex items-center gap-1 rounded-full border border-white/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 p-1 shadow-soft backdrop-blur">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/products" className={navLinkClass}>
                Products
              </NavLink>
              <NavLink to="/cart" className={`relative ${navLinkClass({ isActive: location.pathname === '/cart' })}`}>
                <span className="inline-flex items-center gap-1.5">
                  <FaBagShopping />
                  Cart
                </span>
                {cartCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-soft">
                    {cartCount}
                  </span>
                ) : null}
              </NavLink>
              <NavLink to="/checkout" className={navLinkClass}>
                Checkout
              </NavLink>

              {user ? (
                <>
                  <NavLink to="/orders" className={navLinkClass}>
                    My Orders
                  </NavLink>
                  {user.role === 'admin' ? (
                    <NavLink to="/admin" className={navLinkClass}>
                      Admin
                    </NavLink>
                  ) : null}
                  <NavLink to="/profile" className={navLinkClass}>
                    Profile
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass}>
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Register
                  </NavLink>
                </>
              )}
            </nav>
            <ThemeToggle />
          </div>

          {/* Mobile Header Quick Actions */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/cart"
              onClick={closeMobileMenu}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <FaBagShopping />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-soft">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <FaXmark className="text-lg" /> : <FaBars className="text-lg" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen ? (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 py-6 shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="space-y-2">
              <NavLink to="/" end onClick={closeMobileMenu} className={mobileNavLinkClass}>
                <FaHouse className="text-brand-600" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/products" onClick={closeMobileMenu} className={mobileNavLinkClass}>
                <FaBoxesStacked className="text-brand-600" />
                <span>Browse Products</span>
              </NavLink>
              <NavLink to="/cart" onClick={closeMobileMenu} className={mobileNavLinkClass}>
                <FaBagShopping className="text-brand-600" />
                <span className="flex-1">Cart</span>
                {cartCount > 0 ? (
                  <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    {cartCount}
                  </span>
                ) : null}
              </NavLink>
              <NavLink to="/checkout" onClick={closeMobileMenu} className={mobileNavLinkClass}>
                <FaBagShopping className="text-brand-600" />
                <span>Checkout</span>
              </NavLink>

              {user ? (
                <>
                  <NavLink to="/orders" onClick={closeMobileMenu} className={mobileNavLinkClass}>
                    <FaClipboardList className="text-brand-600" />
                    <span>My Orders</span>
                  </NavLink>

                  {user.role === 'admin' ? (
                    <NavLink to="/admin" onClick={closeMobileMenu} className={mobileNavLinkClass}>
                      <FaBoxesStacked className="text-brand-600" />
                      <span>Admin Control Panel</span>
                    </NavLink>
                  ) : null}

                  <NavLink to="/profile" onClick={closeMobileMenu} className={mobileNavLinkClass}>
                    <FaUser className="text-brand-600" />
                    <span>My Account ({user.name})</span>
                  </NavLink>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-base font-bold text-white shadow-soft transition hover:bg-red-700"
                    >
                      <FaRightFromBracket />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <NavLink
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100"
                  >
                    <FaRightToBracket />
                    <span>Log In</span>
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-soft hover:bg-brand-700"
                  >
                    <FaUserPlus />
                    <span>Register</span>
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
