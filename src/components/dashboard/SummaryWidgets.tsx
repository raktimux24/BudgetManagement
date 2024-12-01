import React from 'react';
import { CreditCard, Calendar, Clock } from 'lucide-react';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';

export function SummaryWidgets() {
  const { totalMonthlySpend, activeSubscriptions, upcomingRenewals, loading } = useDashboardSummary();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const widgets = [
    {
      icon: CreditCard,
      label: 'Monthly Spend',
      value: loading ? '-' : formatCurrency(totalMonthlySpend),
      description: 'Total monthly subscription costs',
      loading,
    },
    {
      icon: Calendar,
      label: 'Active Subscriptions',
      value: loading ? '-' : activeSubscriptions.toString(),
      description: 'Number of active subscriptions',
      loading,
    },
    {
      icon: Clock,
      label: 'Upcoming Payments',
      value: loading ? '-' : upcomingRenewals.toString(),
      description: 'Payments due in next 30 days',
      loading,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {widgets.map((widget, index) => (
        <div
          key={index}
          className={`bg-[#1A1A1A] rounded-lg p-4 sm:p-6 border border-[#2A2A2A] transition-all duration-200 ${
            widget.loading ? 'opacity-70' : 'opacity-100'
          }`}
        >
          <div className="flex items-start sm:items-center space-x-3 mb-3 sm:mb-4">
            <div className="p-2 rounded-lg bg-[#2A2A2A] shrink-0">
              <widget.icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#00A6B2]" />
            </div>
            <h3 className="text-sm sm:text-base text-[#EAEAEA] font-medium">{widget.label}</h3>
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <div className="text-lg sm:text-2xl font-semibold text-[#EAEAEA]">
              {widget.loading ? (
                <div className="animate-pulse bg-[#2A2A2A] h-6 sm:h-8 w-20 sm:w-24 rounded" />
              ) : (
                widget.value
              )}
            </div>
            <div className="text-xs sm:text-sm text-[#C0C0C0]">{widget.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}