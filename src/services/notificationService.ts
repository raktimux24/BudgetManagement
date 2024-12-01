import { supabase } from '../lib/supabase';
import { createNotification, getNotificationTitle, getNotificationMessage } from '../utils/notifications';
import { Subscription } from '../types/subscription';

export class NotificationService {
  static async createPaymentNotification(subscription: Subscription) {
    const { amount, name, next_billing_date, user_id, id } = subscription;
    
    try {
      await createNotification({
        userId: user_id,
        title: getNotificationTitle('payment', name),
        message: getNotificationMessage('payment', name, amount, new Date(next_billing_date).toLocaleDateString()),
        type: 'payment',
        relatedId: id
      });
    } catch (error) {
      console.error('Error creating payment notification:', error);
    }
  }

  static async createRenewalNotification(subscription: Subscription) {
    const { name, next_billing_date, user_id, id } = subscription;
    
    try {
      await createNotification({
        userId: user_id,
        title: getNotificationTitle('renewal', name),
        message: getNotificationMessage('renewal', name, undefined, new Date(next_billing_date).toLocaleDateString()),
        type: 'renewal',
        relatedId: id
      });
    } catch (error) {
      console.error('Error creating renewal notification:', error);
    }
  }

  static async createBudgetAlertNotification(userId: string, currentSpend: number, budgetLimit: number) {
    try {
      await createNotification({
        userId,
        title: getNotificationTitle('budget', ''),
        message: `You've spent $${currentSpend.toFixed(2)} out of your $${budgetLimit.toFixed(2)} monthly budget.`,
        type: 'budget'
      });
    } catch (error) {
      console.error('Error creating budget notification:', error);
    }
  }

  static async createCancellationNotification(subscription: Subscription) {
    const { name, next_billing_date, user_id, id } = subscription;
    
    try {
      await createNotification({
        userId: user_id,
        title: getNotificationTitle('cancellation', name),
        message: getNotificationMessage('cancellation', name, undefined, new Date(next_billing_date).toLocaleDateString()),
        type: 'cancellation',
        relatedId: id
      });
    } catch (error) {
      console.error('Error creating cancellation notification:', error);
    }
  }

  static async checkAndCreatePaymentNotifications(subscriptions: Subscription[]) {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    for (const subscription of subscriptions) {
      if (subscription.status !== 'active') continue;

      const nextBillingDate = new Date(subscription.next_billing_date);
      if (nextBillingDate <= thirtyDaysFromNow && nextBillingDate > today) {
        await this.createPaymentNotification(subscription);
      }
    }
  }

  static async checkAndCreateRenewalNotifications(subscriptions: Subscription[]) {
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    for (const subscription of subscriptions) {
      if (subscription.status !== 'active') continue;

      const nextBillingDate = new Date(subscription.next_billing_date);
      if (nextBillingDate <= sevenDaysFromNow && nextBillingDate > today) {
        await this.createRenewalNotification(subscription);
      }
    }
  }

  static async checkBudgetAndNotify(userId: string, currentSpend: number, budgetLimit: number) {
    if (currentSpend >= budgetLimit * 0.8) { // Notify at 80% of budget
      await this.createBudgetAlertNotification(userId, currentSpend, budgetLimit);
    }
  }
}
