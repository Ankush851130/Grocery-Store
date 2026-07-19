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
      setSubmitError('Unable to create your account right now. Please review the form and try again.');
    }
  };

  return (
    <AuthPageShell
      eyebrow="Create your account"
      title="Start your grocery shopping journey with a clean auth flow."
      description="We are building this as a real e-commerce system, so registration must be reusable, validated, and ready for the next modules like products, cart, and checkout."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthInput
            label="Full name"
            type="text"
            placeholder="Enter your name"
            autoComplete="name"
            leftIcon={FaUser}
            error={errors.name?.message}
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters long',
              },
            })}
          />
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
            placeholder="Create a strong password"
            autoComplete="new-password"
            leftIcon={FaLock}
            helperText="Use at least 8 characters with a mix of letters and numbers."
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
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          We will add email verification, forgot password, and OTP-style flows in the next auth steps.
        </p>
      </div>
    </AuthPageShell>
  );
}

export default RegisterPage;
