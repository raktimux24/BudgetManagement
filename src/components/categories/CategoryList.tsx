import React, { useState, memo, useMemo, useEffect } from 'react';
import { Edit2, Trash2, BarChart2 } from 'lucide-react';
import { useBudget } from '../../contexts/BudgetContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { EditCategoryModal } from './EditCategoryModal';
import { DeleteCategoryModal } from './DeleteCategoryModal';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface CategoryListProps {
  onAddCategory: () => void;
}

interface CategoryItemProps {
  category: {
    id: string;
    name: string;
    budget: number;
    color: string;
    subscriptions: Array<{
      name: string;
      amount: number;
      billingCycle: string;
    }>;
    totalSpent: number;
  };
  onEdit: (category: {
    id: string;
    name: string;
    budget: number;
    color: string;
  }) => void;
  onDelete: (id: string) => void;
}

const CategoryItem = memo(({ category, onEdit, onDelete }: CategoryItemProps) => (
  <div className="p-6 flex items-center justify-between group hover:bg-[#1F1F1F] transition-colors">
    <div className="flex-1">
      <div className="flex items-center space-x-4">
        <div className="p-2 rounded-lg bg-[#2A2A2A]">
          <BarChart2 className="h-5 w-5" style={{ color: category.color }} />
        </div>
        <div className="space-y-1">
          <h3 className="text-[#EAEAEA] font-medium flex items-center gap-2">
            {category.name}
            {category.totalSpent > category.budget && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-500 rounded-full">
                Over Budget
              </span>
            )}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm text-[#C0C0C0]">
              <span>{category.subscriptions.length} subscriptions</span>
              <span>•</span>
              <span>
                ${category.totalSpent.toFixed(2)} / ${category.budget.toFixed(2)}
              </span>
            </div>
            {category.budget > 0 && (
              <div className="w-48 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    category.totalSpent > category.budget 
                      ? 'bg-red-500' 
                      : category.totalSpent > category.budget * 0.8 
                      ? 'bg-yellow-500' 
                      : 'bg-[#00A6B2]'
                  }`}
                  style={{ width: `${Math.min((category.totalSpent / category.budget) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onEdit(category)}
        className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
      >
        <Edit2 className="h-4 w-4 text-[#C0C0C0]" />
      </button>
      <button
        onClick={() => onDelete(category.id)}
        className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
      >
        <Trash2 className="h-4 w-4 text-[#C0C0C0]" />
      </button>
    </div>
  </div>
));

export function CategoryList({ onAddCategory }: CategoryListProps) {
  const { user } = useAuth();
  const { 
    state: { categories, loading: categoriesLoading, error: categoriesError }
  } = useBudget();
  const { state: { subscriptions, loading: subscriptionsLoading, error: subscriptionsError } } = useSubscription();
  const [editCategory, setEditCategory] = useState<{
    id: string;
    name: string;
    budget: number;
    color: string;
  } | null>(null);
  const [deleteModalCategory, setDeleteModalCategory] = useState<string | null>(null);

  // Log when categories change
  useEffect(() => {
    console.log('Categories updated:', categories);
    console.log('Categories length:', categories.length);
  }, [categories]);

  const enrichedCategories = useMemo(() => {
    return categories.map(category => {
      const categorySubscriptions = subscriptions.filter(
        sub => sub.category === category.id && sub.status === 'active'
      );

      const totalSpent = categorySubscriptions.reduce((total, sub) => {
        const amount = Number(sub.amount) || 0;
        return total + (
          sub.billing_cycle === 'yearly' ? amount / 12 :
          sub.billing_cycle === 'quarterly' ? amount / 3 :
          amount
        );
      }, 0);

      return {
        ...category,
        subscriptions: categorySubscriptions.map(sub => ({
          name: sub.name,
          amount: Number(sub.amount) || 0,
          billingCycle: sub.billing_cycle
        })),
        totalSpent
      };
    });
  }, [categories, subscriptions]);

  if (categoriesLoading || subscriptionsLoading) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-6">
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

  if (categoriesError || subscriptionsError) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-6">
        <p className="text-red-500">
          {categoriesError || subscriptionsError}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
        <div className="p-6 border-b border-[#2A2A2A]">
          <h2 className="text-lg font-semibold text-[#EAEAEA]">All Categories</h2>
        </div>

        <div className="divide-y divide-[#2A2A2A]">
          {enrichedCategories.length > 0 ? (
            enrichedCategories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onEdit={setEditCategory}
                onDelete={setDeleteModalCategory}
              />
            ))
          ) : (
            <div className="p-6 text-center text-[#C0C0C0]">
              No categories yet
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#2A2A2A]">
          <button
            onClick={onAddCategory}
            className="w-full py-2 bg-[#2A2A2A] text-[#EAEAEA] rounded-lg hover:bg-[#3A3A3A] transition-colors"
          >
            Add Category
          </button>
        </div>
      </div>

      {editCategory && (
        <EditCategoryModal
          isOpen={!!editCategory}
          onClose={() => setEditCategory(null)}
          category={editCategory}
        />
      )}

      {deleteModalCategory && (
        <DeleteCategoryModal
          isOpen={!!deleteModalCategory}
          onClose={() => setDeleteModalCategory(null)}
          categoryId={deleteModalCategory}
          categoryName={categories.find(c => c.id === deleteModalCategory)?.name || ''}
        />
      )}
    </>
  );
}