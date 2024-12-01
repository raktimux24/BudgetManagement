import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly' | 'quarterly';
  category: string;
  startDate: string;
  description?: string;
  reminderDays: number;
  status: 'active' | 'inactive';
  nextPayment: string;
}

interface SubscriptionState {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
}

type SubscriptionAction = 
  | { type: 'SET_SUBSCRIPTIONS'; payload: Subscription[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_SUBSCRIPTION'; payload: Subscription }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: Subscription }
  | { type: 'DELETE_SUBSCRIPTION'; payload: string };

const initialState: SubscriptionState = {
  subscriptions: [],
  loading: false,
  error: null
};

const subscriptionReducer = (state: SubscriptionState, action: SubscriptionAction): SubscriptionState => {
  switch (action.type) {
    case 'SET_SUBSCRIPTIONS':
      return { ...state, subscriptions: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_SUBSCRIPTION':
      return { ...state, subscriptions: [...state.subscriptions, action.payload] };
    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map(sub => 
          sub.id === action.payload.id ? action.payload : sub
        )
      };
    case 'DELETE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.filter(sub => sub.id !== action.payload)
      };
    default:
      return state;
  }
};

interface SubscriptionContextType {
  state: SubscriptionState;
  dispatch: (action: SubscriptionAction) => void;
  addSubscription: (subscription: Omit<Subscription, 'id' | 'user_id'>) => Promise<Subscription>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<Subscription>;
  deleteSubscription: (id: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);

  // Handle real-time updates
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'SET_SUBSCRIPTIONS', payload: [] });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    const fetchSubscriptions = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('name');
        
        if (error) throw error;
        dispatch({ type: 'SET_SUBSCRIPTIONS', payload: data || [] });
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch subscriptions' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Set up real-time subscription
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
        async (payload) => {
          // Fetch fresh data after any change
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .order('name');
          
          if (error) {
            console.error('Error fetching updated subscriptions:', error);
            return;
          }

          dispatch({ type: 'SET_SUBSCRIPTIONS', payload: data || [] });
        }
      )
      .subscribe();

    // Initial fetch
    fetchSubscriptions();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const value = {
    state: {
      subscriptions: state.subscriptions || [],
      loading: state.loading,
      error: state.error
    },
    dispatch
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}