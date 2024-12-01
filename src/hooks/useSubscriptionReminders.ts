import { useEffect } from 'react';
import { useSubscriptions } from './useSubscriptions';

export function useSubscriptionReminders() {
  const { subscriptions } = useSubscriptions();

  useEffect(() => {
    // Check for subscriptions that need reminders
    const checkReminders = () => {
      subscriptions.forEach(subscription => {
        const nextPayment = new Date(subscription.next_billing_date);
        const today = new Date();
        const daysUntilPayment = Math.ceil(
          (nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // If days until payment matches reminder_days, show notification
        if (daysUntilPayment === subscription.reminder_days) {
          // Request permission for notifications if not granted
          if (Notification.permission !== 'granted') {
            Notification.requestPermission();
          }

          // Show notification if permission is granted
          if (Notification.permission === 'granted') {
            new Notification('Subscription Payment Reminder', {
              body: `Your ${subscription.name} payment of $${subscription.amount} is due in ${subscription.reminder_days} days.`,
              icon: '/favicon.ico', // Add your app's icon path
            });
          }
        }
      });
    };

    // Check reminders immediately and then every 24 hours
    checkReminders();
    const interval = setInterval(checkReminders, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [subscriptions]);
}
