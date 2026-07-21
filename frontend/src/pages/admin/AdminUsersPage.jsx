import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaRotateRight, FaMagnifyingGlass } from 'react-icons/fa6';
import adminService from '../../services/adminService';
import AdminSectionShell from '../../components/admin/AdminSectionShell';
import AdminBadge from '../../components/admin/AdminBadge';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalUsers: 0, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { search: '', role: '' },
  });

  const loadUsers = async (params = {}) => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await adminService.getUsers(params);
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
    loadUsers();
  }, []);

  const onSubmit = async (formValues) => {
    await loadUsers({ search: formValues.search, role: formValues.role, page: 1 });
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

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <span>Total users: {pagination.totalUsers}</span>
      </div>
    </AdminSectionShell>
  );
}

export default AdminUsersPage;
