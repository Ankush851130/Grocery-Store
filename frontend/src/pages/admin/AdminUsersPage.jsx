import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaRotateRight, FaMagnifyingGlass, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import adminService from '../../services/adminService';
import AdminSectionShell from '../../components/admin/AdminSectionShell';
import AdminBadge from '../../components/admin/AdminBadge';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalUsers: 0, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  const { register, handleSubmit, reset, getValues } = useForm({
    defaultValues: { search: '', role: '' },
  });

  const loadUsers = async (params = {}) => {
    setIsLoading(true);
    setMessage('');

    try {
      const currentValues = getValues();
      const queryParams = {
        page: params.page !== undefined ? params.page : pagination.page,
        limit: params.limit !== undefined ? params.limit : pagination.limit,
        search: params.search !== undefined ? params.search : currentValues.search,
        role: params.role !== undefined ? params.role : currentValues.role,
      };

      const response = await adminService.getUsers(queryParams);
      const responseData = response.data?.data || {};
      setUsers(responseData.users || []);
      setPagination(responseData.pagination || pagination);
    } catch (error) {
      setMessage('Unable to load admin users right now.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers({ page: 1, limit: 10 });
  }, []);

  const onSubmit = async (formValues) => {
    await loadUsers({ ...formValues, page: 1, limit: pagination.limit });
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    await loadUsers({ page: newPage });
  };

  const handleLimitChange = async (newLimit) => {
    await loadUsers({ page: 1, limit: Number(newLimit) });
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    await adminService.updateUserRole(userId, { role: nextRole });
    await loadUsers({ search: '', role: '', page: pagination.page });
    setMessage('User role updated successfully.');
  };

  const handleReset = async () => {
    reset({ search: '', role: '' });
    await loadUsers({ page: 1 });
  };

  const inputStyle =
    'w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40';

  return (
    <AdminSectionShell
      title="Manage users"
      description="Search accounts and change user roles when you need admin access for store operations."
      actions={
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:border-indigo-400"
        >
          <FaRotateRight />
          Reset
        </button>
      }
    >
      <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]" onSubmit={handleSubmit(onSubmit)}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Search</span>
          <div className="relative">
            <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Name or email"
              className={`${inputStyle} pl-11`}
              {...register('search')}
            />
          </div>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Role</span>
          <select className={inputStyle} {...register('role')}>
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button
          type="submit"
          className="self-end rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-700"
        >
          Filter users
        </button>
      </form>

      {message ? <div className="mt-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 p-4 text-sm font-semibold text-indigo-700 dark:text-indigo-300">{message}</div> : null}

      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950 dark:text-white">{user.name}</p>
                    <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <AdminBadge tone={user.role === 'admin' ? 'success' : 'neutral'}>{user.role}</AdminBadge>
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{user.phone || 'N/A'}</td>
                  <td className="px-4 py-4">
                    <AdminBadge tone={user.isEmailVerified ? 'success' : 'warning'}>
                      {user.isEmailVerified ? 'Yes' : 'No'}
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => handleRoleToggle(user._id, user.role)}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:border-indigo-400"
                    >
                      Make {user.role === 'admin' ? 'user' : 'admin'}
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && !users.length ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls Bar */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between shadow-soft">
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <span>
            Showing <strong className="font-bold text-slate-900 dark:text-white">{pagination.totalUsers === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}</strong>–<strong className="font-bold text-slate-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.totalUsers)}</strong> of <strong className="font-bold text-slate-900 dark:text-white">{pagination.totalUsers}</strong> users
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Show per page:</span>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500"
            >
              <option value="10">10 users</option>
              <option value="20">20 users</option>
              <option value="50">50 users</option>
              <option value="100">100 users (All)</option>
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

export default AdminUsersPage;
