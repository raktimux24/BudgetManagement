import { Subscription } from '../contexts/SubscriptionContext';

export function calculateMonthlyAmount(amount: number, billingCycle: string): number {
  switch (billingCycle) {
    case 'yearly':
      return amount / 12;
    case 'quarterly':
      return amount / 3;
    default:
      return amount;
  }
}

export function calculateTotalMonthlySpend(subscriptions: Subscription[]): number {
  return subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((total, sub) => total + calculateMonthlyAmount(sub.amount, sub.billingCycle), 0);
}

export function calculateUpcomingPayments(subscriptions: Subscription[]): number {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  return subscriptions.filter(sub => {
    if (sub.status !== 'active') return false;
    const paymentDate = new Date(sub.nextPayment);
    return paymentDate <= thirtyDaysFromNow;
  }).length;
}

export function calculateSpendingTrend(subscriptions: Subscription[]): {
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
} {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);

  const currentSpend = calculateTotalMonthlySpend(subscriptions);
  const lastMonthSpend = calculateTotalMonthlySpend(
    subscriptions.filter(sub => new Date(sub.startDate) <= lastMonth)
  );

  if (lastMonthSpend === 0) return { percentage: 0, trend: 'neutral' };

  const percentageChange = ((currentSpend - lastMonthSpend) / lastMonthSpend) * 100;

  return {
    percentage: Math.abs(percentageChange),
    trend: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral'
  };
}

export function getUpcomingRenewals(subscriptions: Subscription[]): Subscription[] {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  return subscriptions
    .filter(sub => {
      if (sub.status !== 'active') return false;
      const paymentDate = new Date(sub.nextPayment);
      return paymentDate <= thirtyDaysFromNow;
    })
    .sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime());
}