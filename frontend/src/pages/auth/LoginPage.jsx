import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa6';
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
      setSubmitError('Unable to log in right now. Please check your credentials and try again.');
    }
  };

  return (
    <AuthPageShell
      eyebrow="Welcome back"
      title="Sign in to manage shopping, orders, and your profile."
      description="Use the same backend auth flow we designed for a production MERN grocery store. This screen will become the entry point for cart, wishlist, checkout, and profile actions."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </>
      }
    >
      <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <div className="mb-4 rounded-2xl bg-brand-50 p-4 text-xs text-brand-900">
          <p className="font-bold">Demo Quick Fill Logins:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleFillAdmin}
              className="rounded-xl bg-brand-600 px-3 py-1.5 font-semibold text-white transition hover:bg-brand-700"
            >
              Fill Admin (Seller)
            </button>
            <button
              type="button"
              onClick={handleFillUser}
              className="rounded-xl border border-brand-300 bg-white px-3 py-1.5 font-semibold text-brand-700 transition hover:bg-brand-100"
            >
              Fill Customer User
            </button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthInput
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={FaEnvelope}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
          <AuthInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            leftIcon={FaLock}
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters long',
              },
            })}
          />
          {(submitError || authError) ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError || authError}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          Secure cookies are enabled in the backend, so your session will persist after refresh.
        </p>
      </div>
    </AuthPageShell>
  );
}

export default LoginPage;
