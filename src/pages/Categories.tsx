import React from 'react';
import { SubscriptionLayout } from '../components/subscription/SubscriptionLayout';
import { CategoryList } from '../components/categories/CategoryList';
import { CategoryStats } from '../components/categories/CategoryStats';
import { AddCategoryModal } from '../components/categories/AddCategoryModal';
import { Plus } from 'lucide-react';

export function Categories() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  return (
    <SubscriptionLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#EAEAEA]">Categories</h1>
            <p className="text-[#C0C0C0] mt-2">Manage your subscription categories</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00A6B2] text-white rounded-lg hover:bg-[#008A94] transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CategoryList onAddCategory={() => setIsAddModalOpen(true)} />
          </div>
          <div>
            <CategoryStats />
          </div>
        </div>

        <AddCategoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>
    </SubscriptionLayout>
  );
}