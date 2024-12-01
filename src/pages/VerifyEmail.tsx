import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';

export function VerifyEmail() {
  return (
    <AuthLayout>
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#00A6B2]/10 mb-4">
          <Mail className="h-6 w-6 text-[#00A6B2]" />
        </div>
        <h2 className="text-2xl font-bold text-[#EAEAEA]">Check your email</h2>
        <p className="mt-2 text-[#C0C0C0]">
          We've sent you a verification link. Please check your email to verify your account.
        </p>
        <div className="mt-6">
          <Link
            to="/login"
            className="text-[#00A6B2] hover:text-[#008A94] transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}