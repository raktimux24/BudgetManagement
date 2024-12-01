import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Subscription } from '../types/subscription';

export function useSubscriptionDetail(subscriptionId: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!subscriptionId) return;

    // Fetch initial subscription data
    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('id', subscriptionId)
          .single();

        if (error) throw error;
        setSubscription(data);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`subscription-${subscriptionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `id=eq.${subscriptionId}`
        },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            setSubscription(null);
            return;
          }

          // Fetch the updated subscription
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', subscriptionId)
            .single();

          if (!error && data) {
            setSubscription(data);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [subscriptionId]);

  return {
    subscription,
    loading,
    error
  };
}
