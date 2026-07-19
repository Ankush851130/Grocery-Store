import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';

function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const { clearCart } = useCart();

  const handleLogout = async () => {
    clearCart();
    await logout();
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">Your account</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Profile overview</h2>
        <p className="mt-3 text-slate-600">
          This page will later expand into addresses, wishlist, order history, and account security settings.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Name</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{user?.name || 'N/A'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Email</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{user?.email || 'N/A'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Role</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{user?.role || 'user'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Email verified</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {user?.isEmailVerified ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/orders"
            className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700"
          >
            My Orders History
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Signing out...' : 'Logout'}
          </button>
          <Link
            to="/"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
          >
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
