import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUserCheck, FaUserShield } from 'react-icons/fa6';
import AuthPageShell from '../../components/auth/AuthPageShell';
import AuthInput from '../../components/auth/AuthInput';
import useAuth from '../../hooks/useAuth';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, clearError } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const fromPath = location.state?.from?.pathname || '/profile';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleFillAdmin = () => {
    setValue('email', 'admin@grocery.com');
    setValue('password', 'Password@123');
  };

  const handleFillUser = () => {
    setValue('email', 'user@grocery.com');
    setValue('password', 'Password@123');
  };

  const onSubmit = async (formData) => {
    setSubmitError('');
    clearError();

    try {
      await login(formData);
      navigate(fromPath, { replace: true });
    } catch (requestError) {
      setSubmitError('Unable to log in right now. Please check your email and password.');
    }
  };

  return (
    <AuthPageShell
      eyebrow="Welcome Back"
      title="Sign in to your QuickKart Account"
      description="Track active orders, manage your saved delivery addresses, access exclusive member discounts, and reorder your daily needs in seconds."
      footer={
        <>
          New to QuickKart?{' '}
          <Link to="/register" className="font-black text-indigo-600 dark:text-indigo-400 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <div className="rounded-[2rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl">
        {/* QUICK DEMO PRESET LOGINS */}
        <div className="mb-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4 text-xs border border-slate-200 dark:border-slate-700">
          <p className="font-extrabold text-slate-800 dark:text-slate-100">Quick Test Credentials:</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleFillAdmin}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 px-3 py-1.5 font-bold text-white dark:text-slate-900 transition hover:opacity-90 shadow-sm"
            >
              <FaUserShield /> Fill Admin (Seller)
            </button>
            <button
              type="button"
              onClick={handleFillUser}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 font-bold text-slate-800 dark:text-slate-100 transition hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
            >
              <FaUserCheck /> Fill Customer Demo
            </button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={FaEnvelope}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
          <AuthInput
            label="Password"
            type="password"
            placeholder="Enter your account password"
            autoComplete="current-password"
            leftIcon={FaLock}
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
          />
          {(submitError || authError) ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/40 p-4 text-sm font-semibold text-red-600 dark:text-red-400">
              {submitError || authError}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 px-4 py-3.5 text-sm font-black text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in to QuickKart...' : 'Sign In'}
          </button>
        </form>
      </div>
    </AuthPageShell>
  );
}

export default LoginPage;
