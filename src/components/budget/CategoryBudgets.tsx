import React, { useState, useEffect, useMemo } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useBudget } from '../../contexts/BudgetContext';
import { BudgetAlerts } from './BudgetAlerts';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export function CategoryBudgets() {
  const { user } = useAuth();
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions();
  const { state: { categories, loading: categoriesLoading }, updateCategory } = useBudget();
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    budget: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInlineEdit = (category: { id: string; name: string; budget: number }) => {
    setEditingCategory(category);
  };

  const handleSaveInlineEdit = async () => {
    if (!editingCategory) return;

    try {
      console.log('Attempting to save inline edit:', editingCategory);
      setError(null);
      
      // Ensure budget is a number
      const budgetToUpdate = Number(editingCategory.budget);
      console.log('Budget to update:', budgetToUpdate, 'Type:', typeof budgetToUpdate);

      const updatedCategory = await updateCategory(editingCategory.id, { 
        budget: budgetToUpdate 
      });
      
      console.log('Category updated successfully:', updatedCategory);
      setEditingCategory(null);
    } catch (err) {
      console.error('Error updating category budget:', err);
      setError('Failed to update budget');
    }
  };

  const handleCancelInlineEdit = () => {
    setEditingCategory(null);
    setError(null);
  };

  const categorySpending = useMemo(() => {
    if (!subscriptions) return new Map<string, number>();
    
    const spendingMap = new Map<string, number>();
    
    subscriptions.forEach(sub => {
      if (sub.status !== 'active') return;
      
      const amount = Number(sub.amount) || 0;
      const monthlyAmount = sub.billing_cycle === 'yearly' 
        ? amount / 12 
        : sub.billing_cycle === 'quarterly'
        ? amount / 3
        : amount;
      
      const currentSpend = spendingMap.get(sub.category) || 0;
      spendingMap.set(sub.category, currentSpend + monthlyAmount);
    });
    
    return spendingMap;
  }, [subscriptions]);

  if (categoriesLoading || subscriptionsLoading) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#2A2A2A] rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#2A2A2A] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#EAEAEA]">Category Budgets</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <BudgetAlerts />

      <div className="space-y-6 mt-4">
        {categories.map((category) => {
          const spent = categorySpending.get(category.id) || 0;
          const budget = Number(category.budget) || 0;
          const percentageUsed = budget > 0 ? (spent / budget) * 100 : 0;

          return (
            <div key={category.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[#EAEAEA] font-medium">{category.name}</p>
                  {editingCategory?.id === category.id ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <input 
                        type="number"
                        value={editingCategory.budget}
                        onChange={(e) => setEditingCategory(prev => ({
                          ...prev!,
                          budget: Number(e.target.value)
                        }))}
                        className="w-24 px-2 py-1 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
                        min="0"
                        step="1"
                      />
                      <button 
                        onClick={handleSaveInlineEdit}
                        className="text-green-500 hover:text-green-400"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={handleCancelInlineEdit}
                        className="text-red-500 hover:text-red-400"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-[#C0C0C0]">
                      ${spent.toFixed(2)} of ${budget.toFixed(2)}
                      <button 
                        onClick={() => handleInlineEdit({
                          id: category.id,
                          name: category.name,
                          budget: category.budget
                        })}
                        className="ml-2 text-[#00A6B2] hover:text-[#008A94] transition-colors"
                      >
                        <Edit2 className="h-4 w-4 inline" />
                      </button>
                    </p>
                  )}
                </div>
                <div className="w-32">
                  <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percentageUsed >= 100 ? 'bg-red-500' :
                        percentageUsed >= 90 ? 'bg-yellow-500' :
                        'bg-[#00A6B2]'
                      }`}
                      style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#C0C0C0] mt-1 text-right">
                    {percentageUsed.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}