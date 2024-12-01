import React from 'react';
import { useParams } from 'react-router-dom';
import { SubscriptionLayout } from '../components/subscription/SubscriptionLayout';
import { SubscriptionDetailHeader } from '../components/subscription/detail/SubscriptionDetailHeader';
import { SubscriptionInfo } from '../components/subscription/detail/SubscriptionInfo';

export function SubscriptionDetail() {
  const { id } = useParams();

  if (!id) {
    return null;
  }

  return (
    <SubscriptionLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SubscriptionDetailHeader />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SubscriptionInfo />
          </div>
          
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
              <h3 className="text-lg font-semibold text-[#EAEAEA] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href={`https://account.google.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-[#2A2A2A] rounded-lg text-[#EAEAEA] hover:bg-[#2A2A2A] transition-colors"
                >
                  Manage Account
                </a>
                <a
                  href={`https://support.google.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-[#2A2A2A] rounded-lg text-[#EAEAEA] hover:bg-[#2A2A2A] transition-colors"
                >
                  Get Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SubscriptionLayout>
  );
}