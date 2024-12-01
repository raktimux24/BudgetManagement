import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Chrome } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { InputField } from '../components/auth/InputField';
import { SocialButton } from '../components/auth/SocialButton';
import { BackToHome } from '../components/auth/BackToHome';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface LoginFormData {
  email: string;
  password: string;
}

export function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const { signIn, loading, error } = useSupabaseAuth();

  const onSubmit = async (data: LoginFormData) => {
    await signIn(data.email, data.password);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#EAEAEA] text-center">Welcome back</h2>
          <p className="mt-2 text-sm text-[#C0C0C0] text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#00A6B2] hover:text-[#008A94]">
              Sign up
            </Link>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-400/10 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <InputField
            label="Email address"
            name="email"
            type="email"
            register={register}
            error={errors.email?.message}
            placeholder="you@example.com"
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password?.message}
            placeholder="••••••••"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-[#2A2A2A] bg-[#121212] text-[#00A6B2] focus:ring-[#00A6B2]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-[#C0C0C0]">
                Remember me
              </label>
            </div>

            <Link to="/forgot-password" className="text-sm text-[#00A6B2] hover:text-[#008A94]">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00A6B2] hover:bg-[#008A94] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A6B2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2A2A2A]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1A1A1A] text-[#C0C0C0]">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <SocialButton icon={Chrome} onClick={() => {}}>
              Sign in with Google
            </SocialButton>
          </div>
        </div>

        <BackToHome />
      </div>
    </AuthLayout>
  );
}