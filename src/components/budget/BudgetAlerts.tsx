import React, { useEffect, useState } from 'react';
import { AlertTriangle, Bell, X } from 'lucide-react';
import { useBudget } from '../../contexts/BudgetContext';
import { useSubscription } from '../../contexts/SubscriptionContext';

export function BudgetAlerts() {
  const { state: budgetState, dispatch } = useBudget();
  const { state: subscriptionState } = useSubscription();
  const [alerts, setAlerts] = useState<Array<{
    type: 'warning' | 'danger';
    message: string;
    category: string;
  }>>([]);

  useEffect(() => {
    if (!budgetState?.categories || !subscriptionState?.subscriptions) {
      setAlerts([]);
      return;
    }
    if (budgetState.loading || subscriptionState.loading) {
      return;
    }

    const newAlerts: Array<{
      type: 'warning' | 'danger';
      message: string;
      category: string;
    }> = [];

    budgetState.categories.forEach(category => {
      const categorySubscriptions = subscriptionState.subscriptions
        .filter(sub => sub.status === 'active' && sub.category === category.name);

      const spent = categorySubscriptions.reduce((total, sub) => {
        const amount = Number(sub.amount) || 0;
        return total + (
          sub.billing_cycle === 'yearly' ? amount / 12 :
          sub.billing_cycle === 'quarterly' ? amount / 3 :
          amount
        );
      }, 0);

      const budget = Number(category.budget) || 0;
      const percentageUsed = budget > 0 ? (spent / budget) * 100 : 0;

      if (percentageUsed >= 100) {
        newAlerts.push({
          type: 'danger',
          message: `${category.name} is over budget by $${(spent - budget).toFixed(2)}`,
          category: category.name
        });
      } else if (percentageUsed >= 90) {
        newAlerts.push({
          type: 'warning',
          message: `${category.name} is at ${percentageUsed.toFixed(1)}% of budget`,
          category: category.name
        });
      }
    });

    setAlerts(newAlerts);
  }, [budgetState.categories, subscriptionState.subscriptions, budgetState.loading, subscriptionState.loading]);

  if (budgetState.loading || subscriptionState.loading) {
    return (
      <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
        <p className="text-[#EAEAEA]">Loading alerts...</p>
      </div>
    );
  }

  if (budgetState.error || subscriptionState.error) {
    return (
      <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
        <p className="text-red-500">Error loading budget alerts</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
      <h3 className="text-lg font-semibold text-[#EAEAEA] mb-4">Budget Alerts</h3>
      {alerts.map((alert, index) => (
        <div
          key={`${alert.category}-${index}`}
          className={`p-4 rounded-lg flex items-start justify-between space-x-4 ${
            alert.type === 'danger' ? 'bg-red-500/10' : 'bg-yellow-500/10'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-[#2A2A2A]">
              {alert.type === 'danger' ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <Bell className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <div>
              <p className={`font-medium ${
                alert.type === 'danger' ? 'text-red-500' : 'text-yellow-500'
              }`}>
                {alert.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}