import React, { useEffect, useState } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { Bell } from 'lucide-react';

export function SubscriptionAlerts() {
  const { subscriptions } = useSubscriptions();
  const [upcomingPayments, setUpcomingPayments] = useState<Array<{
    name: string;
    amount: number;
    daysUntil: number;
    date: Date;
  }>>([]);

  useEffect(() => {
    const today = new Date();
    const upcoming = subscriptions
      .map(subscription => {
        const nextPayment = new Date(subscription.next_billing_date);
        const daysUntil = Math.ceil(
          (nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          name: subscription.name,
          amount: subscription.amount,
          daysUntil,
          date: nextPayment,
        };
      })
      .filter(payment => payment.daysUntil <= 7) // Show payments due within 7 days
      .sort((a, b) => a.daysUntil - b.daysUntil);

    setUpcomingPayments(upcoming);
  }, [subscriptions]);

  if (upcomingPayments.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-4 mb-6 border border-[#2A2A2A]">
      <div className="flex items-center space-x-2 mb-4">
        <Bell className="h-5 w-5 text-[#00A6B2]" />
        <h2 className="text-lg font-semibold text-[#EAEAEA]">Upcoming Payments</h2>
      </div>
      
      <div className="space-y-3">
        {upcomingPayments.map((payment, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg"
          >
            <div>
              <p className="text-[#EAEAEA] font-medium">{payment.name}</p>
              <p className="text-[#C0C0C0] text-sm">
                Due in {payment.daysUntil} {payment.daysUntil === 1 ? 'day' : 'days'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[#EAEAEA] font-medium">
                ${payment.amount.toFixed(2)}
              </p>
              <p className="text-[#C0C0C0] text-sm">
                {payment.date.toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
