import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa6';
import AuthPageShell from '../../components/auth/AuthPageShell';
import AuthInput from '../../components/auth/AuthInput';
import useAuth from '../../hooks/useAuth';

function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, error: authError, clearError } = useAuth();
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (formData) => {
    setSubmitError('');
    clearError();

    try {
      await registerUser(formData);
      navigate('/profile', { replace: true });
    } catch (requestError) {
      setSubmitError('Unable to create your account right now. Please review the form details and try again.');
    }
  };

  return (
    <AuthPageShell
      eyebrow="Create Free Account"
      title="Join QuickKart Superstore Today"
      description="Unlock 10-minute instant delivery, member-only discounts, real-time order tracking, and express checkout across Electronics, Mobiles, Groceries & Cold Drinks."
      footer={
        <>
          Already have a QuickKart account?{' '}
          <Link to="/login" className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign In
          </Link>
        </>
      }
    >
      <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthInput
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            leftIcon={FaUser}
            error={errors.name?.message}
            {...register('name', {
              required: 'Full name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
          />
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
            placeholder="Create a strong password"
            autoComplete="new-password"
            leftIcon={FaLock}
            helperText="Must be at least 8 characters long."
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
            <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/40 p-4 text-sm font-semibold text-red-600 dark:text-red-400">
              {submitError || authError}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 px-4 py-3.5 text-sm font-black text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </AuthPageShell>
  );
}

export default RegisterPage;
