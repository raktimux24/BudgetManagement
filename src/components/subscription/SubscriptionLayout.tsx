import React from 'react';
import { DashboardHeader } from '../dashboard/DashboardHeader';
import { DashboardFooter } from '../dashboard/DashboardFooter';

interface SubscriptionLayoutProps {
  children: React.ReactNode;
}

export function SubscriptionLayout({ children }: SubscriptionLayoutProps) {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col relative">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00A6B2]/5 via-transparent to-[#6A4C93]/5 pointer-events-none" />
      
      <div className="relative flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1">
          {children}
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}