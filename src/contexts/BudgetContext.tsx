import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface CategoryBudget {
  id: string;
  name: string;
  budget: number;
  color: string;
}

interface BudgetState {
  categories: CategoryBudget[];
  loading: boolean;
  error: string | null;
  alerts: Array<{
    type: 'warning' | 'danger';
    message: string;
    category: string;
  }>;
}

type BudgetAction = 
  | { type: 'ADD_CATEGORY'; payload: Omit<CategoryBudget, 'id' | 'user_id'> }
  | { type: 'UPDATE_CATEGORY'; payload: { 
      id?: string; 
      oldName?: string; 
      name?: string; 
      budget?: number; 
      color?: string 
    } }
  | { type: 'UPDATE_ALL_BUDGETS'; payload: CategoryBudget[] }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_ALERT'; payload: { type: 'warning' | 'danger'; message: string; category: string } }
  | { type: 'CLEAR_ALL_ALERTS' }
  | { type: 'SET_CATEGORIES'; payload: CategoryBudget[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };

interface BudgetContextType {
  state: BudgetState;
  dispatch: React.Dispatch<BudgetAction>;
  addCategory: (category: Omit<CategoryBudget, 'id' | 'user_id'>) => Promise<CategoryBudget>;
  updateCategory: (id: string, updates: Partial<CategoryBudget>) => Promise<CategoryBudget>;
  deleteCategory: (id: string) => Promise<void>;
  updateAllBudgets: (budgets: Partial<CategoryBudget>[]) => Promise<Partial<CategoryBudget>[]>;
}

const initialState: BudgetState = {
  categories: [],
  loading: true,
  error: null,
  alerts: []
};

const budgetReducer = (state: BudgetState, action: BudgetAction): BudgetState => {
  switch (action.type) {
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
        loading: false,
        error: null
      };
    case 'ADD_CATEGORY':
      const updatedCategories = [...state.categories, action.payload].sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      return {
        ...state,
        categories: updatedCategories
      };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(cat => 
          cat.id === action.payload.id 
            ? { 
                ...cat, 
                ...action.payload,
                // Ensure budget is updated correctly
                ...(action.payload.budget !== undefined ? { budget: action.payload.budget } : {})
              }
            : cat
        ).sort((a, b) => a.name.localeCompare(b.name))
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(cat => cat.id !== action.payload)
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Initial fetch of categories
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'SET_CATEGORIES', payload: [] });
      return;
    }

    const fetchCategories = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (error) throw error;
        console.log('Initial categories fetch:', data);
        dispatch({ type: 'SET_CATEGORIES', payload: data || [] });
      } catch (err) {
        console.error('Error fetching categories:', err);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: err instanceof Error ? err.message : 'Failed to fetch categories' 
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchCategories();

    // Set up real-time subscription
    const channel = supabase
      .channel('budget-categories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Received real-time update payload:', payload);
          
          // Fetch fresh data after any change
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id)
            .order('name');
          
          if (error) {
            console.error('Error fetching updated categories:', error);
            return;
          }

          console.log('Updated categories after real-time event:', data);

          // Update the entire categories list
          dispatch({ type: 'SET_CATEGORIES', payload: data || [] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscription');
      channel.unsubscribe();
    };
  }, [user]);

  const updateCategory = async (id: string, updates: Partial<CategoryBudget>) => {
    if (!user) throw new Error('User must be logged in to update categories');

    try {
      console.log('Updating category with id:', id, 'updates:', updates);
      
      // Validate the updates
      if (updates.budget !== undefined && typeof updates.budget !== 'number') {
        console.error('Invalid budget type:', typeof updates.budget);
        throw new Error('Budget must be a number');
      }

      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Category updated:', data);
      
      // Dispatch the updated category to the reducer
      dispatch({ 
        type: 'UPDATE_CATEGORY', 
        payload: {
          id: data.id,
          ...updates
        }
      });

      return data;
    } catch (err) {
      console.error('Error updating category:', err);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: err instanceof Error ? err.message : 'Failed to update category' 
      });
      throw err;
    }
  };

  const addCategory = async (category: Omit<CategoryBudget, 'id' | 'user_id'>) => {
    if (!user) throw new Error('User must be logged in to add categories');

    try {
      console.log('Adding new category:', category);
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...category, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      console.log('Category added:', data);
      
      // Dispatch the new category to the reducer
      dispatch({ 
        type: 'ADD_CATEGORY', 
        payload: data 
      });

      return data;
    } catch (err) {
      console.error('Error adding category:', err);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: err instanceof Error ? err.message : 'Failed to add category' 
      });
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) throw new Error('User must be logged in to delete categories');

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Dispatch the category deletion to the reducer
      dispatch({
        type: 'DELETE_CATEGORY',
        payload: id
      });
    } catch (err) {
      console.error('Error deleting category:', err);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: err instanceof Error ? err.message : 'Failed to delete category' 
      });
      throw err;
    }
  };

  const value = {
    state,
    dispatch,
    addCategory,
    updateCategory,
    deleteCategory,
    updateAllBudgets: async (budgets: Partial<CategoryBudget>[]) => {
      if (!user) throw new Error('User must be logged in');

      try {
        const promises = budgets.map(budget => 
          updateCategory(budget.id!, { budget: budget.budget })
        );
        return Promise.all(promises);
      } catch (err) {
        console.error('Error updating budgets:', err);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: err instanceof Error ? err.message : 'Failed to update budgets' 
        });
        throw err;
      }
    }
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}