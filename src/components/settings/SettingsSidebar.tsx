import React from 'react';
import { User, Shield, Bell, CreditCard } from 'lucide-react';

const menuItems = [
  {
    icon: User,
    label: 'Profile',
    description: 'Manage your personal information'
  },
  {
    icon: Shield,
    label: 'Security',
    description: 'Update your password and security settings'
  },
  {
    icon: Bell,
    label: 'Notifications',
    description: 'Configure your notification preferences'
  },
  {
    icon: CreditCard,
    label: 'Billing',
    description: 'Manage your payment methods and billing'
  }
];

export function SettingsSidebar() {
  return (
    <nav className="space-y-2">
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            className="w-full p-3 flex items-start space-x-3 rounded-lg hover:bg-[#2A2A2A] transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-[#2A2A2A]">
              <Icon className="h-5 w-5 text-[#00A6B2]" />
            </div>
            <div>
              <div className="text-[#EAEAEA] font-medium">{item.label}</div>
              <div className="text-sm text-[#C0C0C0]">{item.description}</div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}