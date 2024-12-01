import React from 'react';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useBudget } from '../../contexts/BudgetContext';

export function BudgetOverview() {
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions();
  const { state: budgetState } = useBudget();

  // Calculate total monthly spend from active subscriptions
  const calculateMonthlySpend = () => {
    if (!subscriptions) return 0;
    
    return subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => {
        const amount = Number(sub.amount) || 0;
        return total + (
          sub.billing_cycle === 'yearly' ? amount / 12 :
          sub.billing_cycle === 'quarterly' ? amount / 3 :
          amount
        );
      }, 0);
  };

  const calculateTotalBudget = () => {
    if (!budgetState?.categories) return 0;
    return budgetState.categories.reduce((total, category) => total + (Number(category.budget) || 0), 0);
  };

  if (budgetState.loading || subscriptionsLoading) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
        <h2 className="text-lg font-semibold text-[#EAEAEA] mb-6">Monthly Budget Overview</h2>
        <p className="text-[#EAEAEA]">Loading budget information...</p>
      </div>
    );
  }

  if (budgetState.error) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
        <h2 className="text-lg font-semibold text-[#EAEAEA] mb-6">Monthly Budget Overview</h2>
        <p className="text-red-500">Error loading budget information</p>
      </div>
    );
  }

  const monthlyBudget = calculateTotalBudget();
  const currentSpend = calculateMonthlySpend();
  const percentageUsed = monthlyBudget > 0 ? (currentSpend / monthlyBudget) * 100 : 0;
  const remaining = Math.max(monthlyBudget - currentSpend, 0);

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
      <h2 className="text-lg font-semibold text-[#EAEAEA] mb-6">Monthly Budget Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-lg bg-[#2A2A2A]">
            <DollarSign className="h-6 w-6 text-[#00A6B2]" />
          </div>
          <div>
            <p className="text-[#C0C0C0]">Total Budget</p>
            <p className="text-2xl font-semibold text-[#EAEAEA]">${monthlyBudget.toFixed(2)}</p>
            <p className="text-sm text-[#C0C0C0]">Monthly limit</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-lg bg-[#2A2A2A]">
            <TrendingUp className="h-6 w-6 text-[#C5A900]" />
          </div>
          <div>
            <p className="text-[#C0C0C0]">Current Spend</p>
            <p className="text-2xl font-semibold text-[#EAEAEA]">${currentSpend.toFixed(2)}</p>
            <p className="text-sm text-[#C0C0C0]">{percentageUsed.toFixed(1)}% of budget</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-lg bg-[#2A2A2A]">
            <AlertTriangle className={`h-6 w-6 ${
              remaining === 0 ? 'text-red-500' :
              remaining < monthlyBudget * 0.2 ? 'text-yellow-500' :
              'text-green-500'
            }`} />
          </div>
          <div>
            <p className="text-[#C0C0C0]">Remaining</p>
            <p className="text-2xl font-semibold text-[#EAEAEA]">${remaining.toFixed(2)}</p>
            <p className="text-sm text-[#C0C0C0]">Until limit</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              percentageUsed >= 100 ? 'bg-red-500' :
              percentageUsed >= 90 ? 'bg-yellow-500' :
              'bg-[#00A6B2]'
            }`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}