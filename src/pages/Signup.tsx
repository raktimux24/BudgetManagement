import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Chrome } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { InputField } from '../components/auth/InputField';
import { SocialButton } from '../components/auth/SocialButton';
import { BackToHome } from '../components/auth/BackToHome';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type SignupFormData = z.infer<typeof signupSchema>;

export function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });
  const { signUp, loading, error } = useSupabaseAuth();

  const onSubmit = async (data: SignupFormData) => {
    await signUp(data.email, data.password, data.name);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#EAEAEA] text-center">Create your account</h2>
          <p className="mt-2 text-sm text-[#C0C0C0] text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00A6B2] hover:text-[#008A94]">
              Sign in
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
            label="Full Name"
            name="name"
            type="text"
            register={register}
            error={errors.name?.message}
            placeholder="John Doe"
          />

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

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 rounded border-[#2A2A2A] bg-[#121212] text-[#00A6B2] focus:ring-[#00A6B2]"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-[#C0C0C0]">
              I agree to the{' '}
              <Link to="/terms" className="text-[#00A6B2] hover:text-[#008A94]">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-[#00A6B2] hover:text-[#008A94]">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00A6B2] hover:bg-[#008A94] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A6B2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create account'}
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
              Sign up with Google
            </SocialButton>
          </div>
        </div>

        <BackToHome />
      </div>
    </AuthLayout>
  );
}