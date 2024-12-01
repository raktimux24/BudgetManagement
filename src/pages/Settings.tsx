import React from 'react';
import { SubscriptionLayout } from '../components/subscription/SubscriptionLayout';
import { SettingsForm } from '../components/settings/SettingsForm';

export function Settings() {
  return (
    <SubscriptionLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#EAEAEA]">Account Settings</h1>
          <p className="text-[#C0C0C0] mt-2">Manage your account preferences and profile information</p>
        </div>

        <SettingsForm />
      </div>
    </SubscriptionLayout>
  );
}