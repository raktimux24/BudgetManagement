import React from 'react';
import { CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex items-center justify-center">
            <CreditCard className="h-12 w-12 text-[#00A6B2]" />
            <span className="ml-2 text-2xl font-bold text-[#EAEAEA]">SubscriptionMaster</span>
          </Link>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[#1A1A1A] py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}