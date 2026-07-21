import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaBagShopping,
  FaBoxesStacked,
  FaCalendarDays,
  FaChartLine,
  FaCircleCheck,
  FaCircleExclamation,
  FaClock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
  FaPenToSquare,
  FaPhone,
  FaRightFromBracket,
  FaShieldHalved,
  FaStore,
  FaUser,
  FaUserCheck,
  FaUserShield,
  FaUsers,
} from 'react-icons/fa6';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import adminService from '../../services/adminService';
import orderService from '../../services/orderService';
import { formatCurrency } from '../../utils/checkout';

const PRESET_AVATARS = [
  { id: 'bot1', label: 'Tech Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FreshBot' },
  { id: 'avatar1', label: 'Alex', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 'avatar2', label: 'Sarah', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'avatar3', label: 'Jordan', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' },
  { id: 'avatar4', label: 'Taylor', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor' },
  { id: 'avatar5', label: 'Morgan', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan' },
  { id: 'shape1', label: 'Geometric', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=GroceryApp' },
  { id: 'identicon1', label: 'Matrix', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=StoreUser' },
];

const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .trim()
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getStatusBadgeTone = (status) => {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'shipped':
    case 'processing':
    case 'confirmed':
      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'cancelled':
      return 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
    default:
      return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }
};

function ProfilePage() {
  const { user, logout, updateProfile, changePassword, isLoading: isAuthLoading } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('overview');

  // Dashboard & Activity States
  const [adminStats, setAdminStats] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Security Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Keep form in sync when user context refreshes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  // Load activity metrics (Admin stats or User orders)
  useEffect(() => {
    let isMounted = true;
    const fetchActivity = async () => {
      if (!user) return;
      setIsLoadingActivity(true);
      try {
        if (isAdmin) {
          const res = await adminService.getDashboardStats();
          if (isMounted) {
            setAdminStats(res.data?.data?.stats || null);
          }
        } else {
          const res = await orderService.getMyOrders();
          if (isMounted) {
            setUserOrders(res.data?.data?.orders || []);
          }
        }
      } catch (err) {
        // Silently handle stat fetch errors without breaking page
      } finally {
        if (isMounted) setIsLoadingActivity(false);
      }
    };

    fetchActivity();
    return () => {
      isMounted = false;
    };
  }, [user, isAdmin]);

  const handleLogout = async () => {
    clearCart();
    await logout();
    navigate('/login');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });

    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      setProfileMsg({ type: 'error', text: 'Name must be at least 2 characters long.' });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        avatar: profileForm.avatar.trim(),
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'Failed to update profile.',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (!passwordForm.currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg({
        type: 'success',
        text: 'Password updated successfully! Redirecting to login...',
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'Failed to change password.',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Password strength checker
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: '', pct: 0 };
    if (pass.length < 8) return { label: 'Too short', color: 'bg-red-500', pct: 25 };
    let score = 0;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    if (pass.length >= 10) score += 1;

    if (score <= 1) return { label: 'Weak', color: 'bg-amber-500', pct: 50 };
    if (score === 2) return { label: 'Good', color: 'bg-blue-500', pct: 75 };
    return { label: 'Strong', color: 'bg-emerald-500', pct: 100 };
  };

  const passStrength = getPasswordStrength(passwordForm.newPassword);

  const formattedJoinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recent Member';

  const userTotalSpent = userOrders.reduce((sum, o) => sum + (o.pricing?.grandTotal || 0), 0);
  const userPendingOrders = userOrders.filter(
    (o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
  ).length;

  return (
    <section className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Dynamic Profile Cover & Header Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft">
        {/* Cover Backdrop Gradient */}
        <div
          className={`h-44 w-full bg-gradient-to-r ${
            isAdmin
              ? 'from-slate-950 via-purple-950 to-slate-900'
              : 'from-slate-950 via-brand-950 to-slate-900'
          } relative`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-4 right-6 flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
              {isAdmin ? 'System Master' : 'Grocery Member'}
            </span>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="relative px-6 pb-6 pt-0 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-20">
            {/* Avatar & Main Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {/* Avatar Box */}
              <div className="relative group">
                <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl p-1 bg-white dark:bg-slate-900 shadow-xl border-2 border-white dark:border-slate-800">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full rounded-[1.25rem] object-cover bg-slate-100 dark:bg-slate-800"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`h-full w-full rounded-[1.25rem] bg-gradient-to-br ${
                      isAdmin
                        ? 'from-purple-600 to-indigo-700'
                        : 'from-brand-500 to-orange-600'
                    } flex items-center justify-center text-2xl sm:text-3xl font-black text-white ${
                      user?.avatar ? 'hidden' : 'flex'
                    }`}
                  >
                    {getInitials(user?.name)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-brand-50 dark:hover:bg-slate-700 transition"
                  title="Change avatar"
                >
                  <FaPenToSquare className="h-4 w-4" />
                </button>
              </div>

              {/* Title & Badges */}
              <div className="space-y-1 sm:pb-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    {user?.name || 'Account User'}
                  </h1>

                  {/* Role Badge */}
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300">
                      <FaUserShield className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      Administrator
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      <FaUserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Verified Customer
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <FaEnvelope className="h-3.5 w-3.5 text-slate-400" />
                    {user?.email}
                  </span>
                  {user?.phone ? (
                    <span className="flex items-center gap-1.5">
                      <FaPhone className="h-3.5 w-3.5 text-slate-400" />
                      {user.phone}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-1.5">
                    <FaCalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    Joined {formattedJoinedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center justify-center sm:justify-end gap-3 sm:pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <FaPenToSquare /> Edit Profile
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isAuthLoading}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/40 px-4 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 transition hover:bg-red-100 dark:hover:bg-red-900/60 disabled:opacity-50"
              >
                <FaRightFromBracket />
                {isAuthLoading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 px-6 sm:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <FaUser /> Overview & Stats
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'edit'
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <FaPenToSquare /> Edit Profile
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <FaLock /> Security & Password
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roleHub')}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'roleHub'
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {isAdmin ? (
                <>
                  <FaShieldHalved className="text-purple-400" /> Admin Control Hub
                </>
              ) : (
                <>
                  <FaBagShopping /> Orders & Shopping Hub
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Header Cards */}
          {isAdmin ? (
            /* Admin Executive Quick Stats */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Total Revenue
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(adminStats?.totalRevenue || 0)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <FaChartLine className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Paid customer orders</p>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Total Orders
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                      {adminStats?.totalOrders ?? (isLoadingActivity ? '...' : 0)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <FaBagShopping className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">System order count</p>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Products Catalog
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                      {adminStats?.totalProducts ?? (isLoadingActivity ? '...' : 0)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <FaBoxesStacked className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Active store inventory</p>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Registered Users
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                      {adminStats?.totalUsers ?? (isLoadingActivity ? '...' : 0)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <FaUsers className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Customer accounts</p>
              </div>
            </div>
          ) : (
            /* User Customer Quick Stats */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Orders Placed
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                      {userOrders.length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                    <FaBagShopping className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Lifetime purchases</p>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      In Progress
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                      {userPendingOrders}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <FaClock className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Processing & active</p>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Total Spent
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(userTotalSpent)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <FaCircleCheck className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">All completed orders</p>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Email Status
                    </p>
                    <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {user?.isEmailVerified ? 'Verified' : 'Active'}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <FaEnvelope className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Account verified</p>
              </div>
            </div>
          )}

          {/* Detailed Profile Information & Quick Actions Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Account Details Card */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Personal Information
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your account identity and contact configuration
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
                >
                  <FaPenToSquare /> Edit
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Full Name</p>
                  <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                    {user?.name || 'N/A'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Email Address</p>
                  <p className="mt-1 text-base font-bold text-slate-900 dark:text-white truncate">
                    {user?.email || 'N/A'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Phone Number</p>
                  <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                    {user?.phone || 'Not added yet'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Account Role</p>
                  <p className="mt-1 text-base font-bold capitalize text-slate-900 dark:text-white flex items-center gap-2">
                    {user?.role || 'user'}
                    {isAdmin ? (
                      <span className="rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[10px] px-2 py-0.5 font-bold uppercase">
                        Admin Privileges
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>

              {/* Security Status Box */}
              <div className="rounded-2xl bg-slate-900 text-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
                    <FaKey /> Security Guard
                  </div>
                  <p className="text-sm font-bold">Password & Authorization</p>
                  <p className="text-xs text-slate-400">
                    Protect your account with a secure password and credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-700 whitespace-nowrap"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Quick Action Navigation Column */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Quick Shortcuts
              </h3>

              {isAdmin ? (
                <div className="space-y-3">
                  <Link
                    to="/admin"
                    className="flex items-center justify-between rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/30 p-4 transition hover:bg-purple-100/60 dark:hover:bg-purple-950/60 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white">
                        <FaStore />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Admin Dashboard</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">System overview</p>
                      </div>
                    </div>
                    <FaArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/admin/products"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <FaBoxesStacked />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Manage Products</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Add & edit catalog</p>
                      </div>
                    </div>
                    <FaArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/admin/orders"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <FaBagShopping />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Customer Orders</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Process fulfillments</p>
                      </div>
                    </div>
                    <FaArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/admin/users"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <FaUsers />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Manage Users</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Roles & permissions</p>
                      </div>
                    </div>
                    <FaArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/orders"
                    className="flex items-center justify-between rounded-2xl border border-brand-200 dark:border-brand-900/50 bg-brand-50/50 dark:bg-brand-950/30 p-4 transition hover:bg-brand-100/60 dark:hover:bg-brand-950/60 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                        <FaBagShopping />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">My Orders</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">View order history</p>
                      </div>
                    </div>
                    <FaArrowRight className="h-4 w-4 text-brand-600 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/cart"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <FaBagShopping />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">My Cart</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">View saved items</p>
                      </div>
                    </div>
                    <FaArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/products"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <FaBoxesStacked />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Browse Grocery</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Discover fresh goods</p>
                      </div>
                    </div>
                    <FaArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDIT PROFILE */}
      {activeTab === 'edit' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FaPenToSquare className="text-brand-600" /> Edit Profile Details
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Update your personal display name, contact phone number, and choose your avatar icon.
            </p>
          </div>

          {profileMsg.text ? (
            <div
              className={`flex items-center gap-3 rounded-2xl p-4 text-xs font-bold border ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <FaCircleCheck className="h-4 w-4 shrink-0" />
              ) : (
                <FaCircleExclamation className="h-4 w-4 shrink-0" />
              )}
              {profileMsg.text}
            </div>
          ) : null}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Full Name Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <FaUser />
                  </span>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 dark:text-white shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Phone Number Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <FaPhone />
                  </span>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 dark:text-white shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Email Address (Primary Login)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400">Email address cannot be changed directly for account integrity.</p>
            </div>

            {/* Avatar Preset Selector */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Select Profile Avatar
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {PRESET_AVATARS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, avatar: item.url })}
                    className={`relative rounded-2xl p-2 border-2 transition text-center flex flex-col items-center gap-1 ${
                      profileForm.avatar === item.url
                        ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/60 ring-2 ring-brand-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.label}
                      className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 object-cover"
                    />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate w-full">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Or enter custom Avatar Image URL
                </label>
                <input
                  type="url"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  placeholder="https://example.com/my-photo.jpg"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="rounded-2xl bg-brand-600 px-6 py-3 text-xs font-bold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-50"
              >
                {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileForm({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    avatar: user?.avatar || '',
                  });
                  setProfileMsg({ type: '', text: '' });
                }}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FaLock className="text-brand-600" /> Account Security & Password
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Update your account password to ensure maximum security.
            </p>
          </div>

          {passwordMsg.text ? (
            <div
              className={`flex items-center gap-3 rounded-2xl p-4 text-xs font-bold border ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800'
              }`}
            >
              {passwordMsg.type === 'success' ? (
                <FaCircleCheck className="h-4 w-4 shrink-0" />
              ) : (
                <FaCircleExclamation className="h-4 w-4 shrink-0" />
              )}
              {passwordMsg.text}
            </div>
          ) : null}

          <form onSubmit={handlePasswordSubmit} className="max-w-xl space-y-5">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FaKey />
                </span>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-11 pr-12 text-sm font-semibold text-slate-900 dark:text-white shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FaLock />
                </span>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-11 pr-12 text-sm font-semibold text-slate-900 dark:text-white shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Strength Indicator Bar */}
              {passwordForm.newPassword ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Strength</span>
                    <span className="text-slate-700 dark:text-slate-300">{passStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passStrength.color}`}
                      style={{ width: `${passStrength.pct}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FaLock />
                </span>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-11 pr-12 text-sm font-semibold text-slate-900 dark:text-white shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="rounded-2xl bg-slate-900 text-white dark:bg-brand-600 px-6 py-3 text-xs font-bold shadow-soft transition hover:bg-slate-800 dark:hover:bg-brand-700 disabled:opacity-50"
              >
                {isUpdatingPassword ? 'Updating Password...' : 'Update Security Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: ROLE SPECIFIC PORTAL (ADMIN OR USER) */}
      {activeTab === 'roleHub' && (
        <div className="space-y-6">
          {isAdmin ? (
            /* Admin Management Control Center */
            <div className="rounded-3xl border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FaShieldHalved className="text-purple-600" /> Admin Control Center
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Full system administrative access & store operations dashboard
                  </p>
                </div>

                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-soft transition hover:bg-purple-700"
                >
                  Open Full Admin Panel <FaArrowRight />
                </Link>
              </div>

              {/* Admin Privileges Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 p-5 border border-purple-100 dark:border-purple-900/50 space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white">
                    <FaBoxesStacked />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Product Inventory</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Create new items, set prices, manage discounts, and restock levels.
                  </p>
                  <Link
                    to="/admin/products"
                    className="inline-block pt-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Go to Products &rarr;
                  </Link>
                </div>

                <div className="rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 p-5 border border-blue-100 dark:border-blue-900/50 space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <FaBagShopping />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Order Fulfillment</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update order status, tracking numbers, and view customer invoices.
                  </p>
                  <Link
                    to="/admin/orders"
                    className="inline-block pt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Go to Orders &rarr;
                  </Link>
                </div>

                <div className="rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 p-5 border border-amber-100 dark:border-amber-900/50 space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white">
                    <FaUsers />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">User Accounts</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    View customer directory, assign administrative roles, and verify accounts.
                  </p>
                  <Link
                    to="/admin/users"
                    className="inline-block pt-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Go to Users &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* User Orders & Shopping Portal */
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FaBagShopping className="text-brand-600" /> Recent Order Activity
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Overview of your recent grocery orders and delivery statuses
                  </p>
                </div>

                <Link
                  to="/orders"
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-soft transition hover:bg-brand-700"
                >
                  View All Orders <FaArrowRight />
                </Link>
              </div>

              {isLoadingActivity ? (
                <div className="py-12 text-center text-xs font-semibold text-slate-400">
                  Loading order history...
                </div>
              ) : userOrders.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-8 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600">
                    <FaBagShopping className="h-7 w-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">No orders placed yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Explore our fresh grocery selection and make your first order today!
                  </p>
                  <Link
                    to="/products"
                    className="inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-700 transition"
                  >
                    Start Shopping Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.slice(0, 5).map((order) => (
                    <div
                      key={order._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Order #{order.orderNumber || order._id.slice(-6)}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${getStatusBadgeTone(
                              order.orderStatus
                            )}`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {order.items?.length || 0} item(s) • Placed on{' '}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {formatCurrency(order.pricing?.grandTotal || 0)}
                        </span>
                        <Link
                          to="/orders"
                          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default ProfilePage;
