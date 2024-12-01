import React from 'react';
import { SubscriptionLayout } from '../components/subscription/SubscriptionLayout';
import { BudgetOverview } from '../components/budget/BudgetOverview';
import { CategoryBudgets } from '../components/budget/CategoryBudgets';
import { BudgetAlerts } from '../components/budget/BudgetAlerts';

export function Budget() {
  return (
    <SubscriptionLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#EAEAEA]">Budget Management</h1>
          <p className="text-[#C0C0C0] mt-2">Set and monitor your subscription spending limits</p>
        </div>

        <div className="space-y-8">
          <BudgetOverview />
          <CategoryBudgets />
          
        </div>
      </div>
    </SubscriptionLayout>
  );
}