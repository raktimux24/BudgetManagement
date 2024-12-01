import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Subscription } from '../../../contexts/SubscriptionContext';

interface PaymentHistoryProps {
  subscription: Subscription;
}

export function PaymentHistory({ subscription }: PaymentHistoryProps) {
  // Generate mock payment history based on start date
  const generatePaymentHistory = () => {
    const history = [];
    const startDate = new Date(subscription.startDate);
    const today = new Date();
    let currentDate = new Date(startDate);

    while (currentDate <= today) {
      history.push({
        date: new Date(currentDate),
        amount: subscription.amount,
        status: 'Paid'
      });

      switch (subscription.billingCycle) {
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        case 'quarterly':
          currentDate.setMonth(currentDate.getMonth() + 3);
          break;
      }
    }

    return history.reverse();
  };

  const paymentHistory = generatePaymentHistory();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
      <h2 className="text-lg font-semibold text-[#EAEAEA] mb-6">Payment History</h2>
      
      <div className="space-y-4">
        {paymentHistory.map((payment, index) => (
          <div 
            key={index}
            className="flex items-center justify-between py-3 border-b border-[#2A2A2A] last:border-0"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-[#EAEAEA]">{formatDate(payment.date)}</p>
                <p className="text-sm text-[#C0C0C0]">{payment.status}</p>
              </div>
            </div>
            <p className="text-[#EAEAEA] font-medium">
              {formatCurrency(payment.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}