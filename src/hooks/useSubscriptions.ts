import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export interface Subscription {
  id?: string;
  user_id: string;
  name: string;
  amount: number;
  billing_cycle: string;
  category: string;
  status?: string;
  next_billing_date: Date;
  description?: string;
  reminder_days?: number;
  created_at?: Date;
  updated_at?: Date;
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSubscriptions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const processedSubscriptions = (data || []).map(sub => ({
        ...sub,
        next_billing_date: new Date(sub.next_billing_date),
        created_at: sub.created_at ? new Date(sub.created_at) : undefined,
        updated_at: sub.updated_at ? new Date(sub.updated_at) : undefined,
        amount: Number(sub.amount)
      }));

      setSubscriptions(processedSubscriptions);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    fetchSubscriptions();

    const channel = supabase
      .channel('subscriptions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newSub = {
              ...payload.new,
              next_billing_date: new Date(payload.new.next_billing_date),
              created_at: payload.new.created_at ? new Date(payload.new.created_at) : undefined,
              updated_at: payload.new.updated_at ? new Date(payload.new.updated_at) : undefined,
              amount: Number(payload.new.amount)
            };
            setSubscriptions(prev => [newSub, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setSubscriptions(prev => 
              prev.map(sub => 
                sub.id === payload.new.id ? {
                  ...sub,
                  ...payload.new,
                  next_billing_date: new Date(payload.new.next_billing_date),
                  updated_at: payload.new.updated_at ? new Date(payload.new.updated_at) : undefined,
                  amount: Number(payload.new.amount)
                } : sub
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setSubscriptions(prev => prev.filter(sub => sub.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, fetchSubscriptions]);

  const addSubscription = async (subscription: Omit<Subscription, 'id' | 'user_id' | 'status'>) => {
    if (!user) throw new Error('User must be logged in to add subscriptions');

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{ ...subscription, user_id: user.id, status: 'active' }])
        .select()
        .single();

      if (error) throw error;

      const processedSubscription = {
        ...data,
        next_billing_date: new Date(data.next_billing_date),
        created_at: data.created_at ? new Date(data.created_at) : undefined,
        updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
        amount: Number(data.amount)
      };

      return processedSubscription;
    } catch (err) {
      console.error('Error adding subscription:', err);
      throw err;
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Omit<Subscription, 'id' | 'user_id'>>) => {
    if (!user) throw new Error('User must be logged in to update subscriptions');

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        next_billing_date: new Date(data.next_billing_date),
        created_at: data.created_at ? new Date(data.created_at) : undefined,
        updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
        amount: Number(data.amount)
      };
    } catch (err) {
      console.error('Error updating subscription:', err);
      throw err;
    }
  };

  const deleteSubscription = async (id: string) => {
    if (!user) throw new Error('User must be logged in to delete subscriptions');

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting subscription:', err);
      throw err;
    }
  };

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription
  };
}