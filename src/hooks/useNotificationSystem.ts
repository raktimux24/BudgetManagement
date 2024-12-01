import { useEffect } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useBudget } from '../contexts/BudgetContext';
import { useNotification } from '../contexts/NotificationContext';

export function useNotificationSystem() {
  const { subscriptions = [], loading: subscriptionLoading } = useSubscription();
  const { categories = [], loading: budgetLoading } = useBudget();
  const { dispatch } = useNotification();

  // Check for upcoming payments
  useEffect(() => {
    if (subscriptionLoading) return;

    subscriptions.forEach(subscription => {
      if (subscription.status !== 'active') return;

      const nextPayment = new Date(subscription.nextPayment);
      const today = new Date();
      const daysUntilPayment = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilPayment <= subscription.reminderDays && daysUntilPayment > 0) {
        const notificationId = `payment-${subscription.id}-${daysUntilPayment}`;
        
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: notificationId,
            title: 'Upcoming Payment',
            message: `Payment of $${subscription.amount} for ${subscription.name} is due in ${daysUntilPayment} days`,
            type: 'payment',
            timestamp: Date.now(),
            isRead: false,
            relatedId: subscription.id
          }
        });
      }
    });
  }, [subscriptions, subscriptionLoading, dispatch]);

  // Check for renewals
  useEffect(() => {
    if (subscriptionLoading) return;

    subscriptions.forEach(subscription => {
      if (subscription.status !== 'active') return;

      const nextPayment = new Date(subscription.nextPayment);
      const today = new Date();
      const daysUntilRenewal = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilRenewal <= 7 && subscription.billingCycle === 'yearly') {
        const notificationId = `renewal-${subscription.id}-${daysUntilRenewal}`;
        
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: notificationId,
            title: 'Annual Renewal',
            message: `${subscription.name} subscription will renew automatically in ${daysUntilRenewal} days`,
            type: 'renewal',
            timestamp: Date.now(),
            isRead: false,
            relatedId: subscription.id
          }
        });
      }
    });
  }, [subscriptions, subscriptionLoading, dispatch]);

  // Monitor budget alerts
  useEffect(() => {
    if (subscriptionLoading || budgetLoading) return;

    categories.forEach(category => {
      const categorySubscriptions = subscriptions
        .filter(sub => sub.status === 'active' && sub.category === category.name);

      const spent = categorySubscriptions.reduce((total, sub) => {
        const amount = Number(sub.amount) || 0;
        return total + (
          sub.billingCycle === 'yearly' ? amount / 12 :
          sub.billingCycle === 'quarterly' ? amount / 3 :
          amount
        );
      }, 0);

      const budget = Number(category.budget) || 0;
      const percentageUsed = budget > 0 ? (spent / budget) * 100 : 0;

      if (percentageUsed >= 90) {
        const notificationId = `budget-${category.name}-${Math.floor(percentageUsed)}`;
        
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: notificationId,
            title: 'Budget Alert',
            message: percentageUsed >= 100
              ? `${category.name} category has exceeded its monthly budget`
              : `${category.name} category is approaching its monthly budget limit`,
            type: 'budget',
            timestamp: Date.now(),
            isRead: false
          }
        });
      }
    });
  }, [subscriptions, categories, subscriptionLoading, budgetLoading, dispatch]);
}