import React from 'react';
import { useParams } from 'react-router-dom';
import { useSubscriptionDetail } from '../../../hooks/useSubscriptionDetail';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { Loader2 } from 'lucide-react';

export function SubscriptionInfo() {
  const { id } = useParams<{ id: string }>();
  const { subscription, loading, error } = useSubscriptionDetail(id || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-[#00A6B2]" />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500">Failed to load subscription details</p>
      </div>
    );
  }

  const infoItems = [
    {
      label: 'Category',
      value: subscription.category
    },
    {
      label: 'Amount',
      value: formatCurrency(subscription.amount)
    },
    {
      label: 'Billing Cycle',
      value: subscription.billing_cycle.charAt(0).toUpperCase() + subscription.billing_cycle.slice(1)
    },
    {
      label: 'Next Billing Date',
      value: subscription.next_billing_date ? formatDate(subscription.next_billing_date) : 'Not set'
    },
    {
      label: 'Status',
      value: subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
    },
    {
      label: 'Reminder Days',
      value: subscription.reminder_days ? `${subscription.reminder_days} days before billing` : 'Not set'
    }
  ];

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-[#EAEAEA]">Subscription Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {infoItems.map((item, index) => (
          <div key={index} className="space-y-1">
            <p className="text-sm text-[#C0C0C0]">{item.label}</p>
            <p className="text-[#EAEAEA]">{item.value}</p>
          </div>
        ))}
      </div>

      {subscription.description && (
        <div className="space-y-1 border-t border-[#2A2A2A] pt-6 mt-6">
          <p className="text-sm text-[#C0C0C0]">Description</p>
          <p className="text-[#EAEAEA] whitespace-pre-wrap">{subscription.description}</p>
        </div>
      )}

      <div className="border-t border-[#2A2A2A] pt-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-[#C0C0C0]">Created</p>
            <p className="text-[#EAEAEA]">{formatDate(subscription.created_at)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[#C0C0C0]">Last Updated</p>
            <p className="text-[#EAEAEA]">{formatDate(subscription.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}