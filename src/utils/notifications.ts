import { supabase } from '../lib/supabase';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'payment' | 'renewal' | 'budget' | 'cancellation';
  relatedId?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  relatedId
}: CreateNotificationParams) {
  try {
    const { error } = await supabase.from('notifications').insert([
      {
        user_id: userId,
        title,
        message,
        type,
        related_id: relatedId,
        is_read: false
      }
    ]);

    if (error) throw error;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
}

export function getNotificationTitle(type: string, name: string): string {
  switch (type) {
    case 'payment':
      return `Payment Due: ${name}`;
    case 'renewal':
      return `Subscription Renewal: ${name}`;
    case 'budget':
      return 'Budget Alert';
    case 'cancellation':
      return `Subscription Cancelled: ${name}`;
    default:
      return 'Notification';
  }
}

export function getNotificationMessage(
  type: string,
  name: string,
  amount?: number,
  date?: string
): string {
  switch (type) {
    case 'payment':
      return `Your payment of $${amount} for ${name} is due ${date ? `on ${date}` : 'soon'}.`;
    case 'renewal':
      return `Your subscription to ${name} will renew ${
        date ? `on ${date}` : 'soon'
      }. Please review your subscription details.`;
    case 'budget':
      return `You're approaching your monthly budget limit. Consider reviewing your subscriptions.`;
    case 'cancellation':
      return `Your subscription to ${name} has been cancelled. The service will end ${
        date ? `on ${date}` : 'at the end of the billing period'
      }.`;
    default:
      return 'You have a new notification.';
  }
}
