import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  budget: number;
  color: string;
  user_id: string;
}

export interface Subscription {
  id: string;
  category: string;
  status: string;
}

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial data fetch
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setCategories([]);
      setSubscriptions([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching initial data...');

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (categoriesError) throw categoriesError;
        console.log('Initial categories:', categoriesData);
        setCategories(categoriesData || []);

        // Fetch subscriptions
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('id, category, status')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (subscriptionsError) throw subscriptionsError;
        console.log('Initial subscriptions:', subscriptionsData);
        setSubscriptions(subscriptionsData || []);
      } catch (err) {
        console.error('Error in useCategories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setCategories([]);
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // CRUD operations
  const addCategory = async (category: Omit<Category, 'id' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...category, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user) throw new Error('User not authenticated');

    if (typeof id === 'object') {
      console.error('Invalid id format:', id);
      throw new Error('Invalid category ID format');
    }

    console.log('useCategories: Updating category with id:', id, 'updates:', updates);
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('useCategories: Error updating category:', error);
      throw error;
    }
    console.log('useCategories: Update successful, result:', data);
    return data;
  };

  const deleteCategory = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    if (typeof id === 'object') {
      console.error('Invalid id format:', id);
      throw new Error('Invalid category ID format');
    }

    console.log('useCategories: Deleting category with id:', id);
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('useCategories: Error deleting category:', error);
      throw error;
    }

    console.log('useCategories: Category deleted successfully');
    // Update local state immediately
    setCategories(current => current.filter(cat => cat.id !== id));
  };

  const updateAllBudgets = async (budgets: Partial<Category>[]) => {
    if (!user) throw new Error('User not authenticated');

    const promises = budgets.map(async (budget) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ budget: budget.budget })
        .eq('id', budget.id!)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    return Promise.all(promises);
  };

  return {
    categories,
    subscriptions,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    updateAllBudgets,
  };
}