import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useBudget } from '../../contexts/BudgetContext';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditBudgetModal({ isOpen, onClose }: EditBudgetModalProps) {
  const { state, updateAllBudgets } = useBudget();
  const [budgets, setBudgets] = React.useState(
    state.categories.map(cat => ({ 
      id: cat.id, 
      name: cat.name, 
      budget: cat.budget 
    }))
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Sync local state with global state when it changes
  React.useEffect(() => {
    setBudgets(
      state.categories.map(cat => ({ 
        id: cat.id, 
        name: cat.name, 
        budget: cat.budget 
      }))
    );
  }, [state.categories]);

  const handleBudgetChange = (categoryName: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setBudgets(prev =>
      prev.map(cat =>
        cat.name === categoryName ? { ...cat, budget: numValue } : cat
      )
    );
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare budgets for update
      const budgetsToUpdate = budgets.map(({ id, budget }) => ({ id, budget }));
      
      await updateAllBudgets(budgetsToUpdate);
      
      onClose();
    } catch (err) {
      console.error('Failed to update budgets:', err);
      setError(err instanceof Error ? err.message : 'Failed to update budgets');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />

        <div className="relative bg-[#1A1A1A] rounded-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-semibold text-[#EAEAEA]">
              Edit Category Budgets
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-[#C0C0C0] hover:text-[#EAEAEA] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {budgets.map((category) => (
              <div key={category.name} className="space-y-2">
                <label className="block text-sm font-medium text-[#EAEAEA]">
                  {category.name}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]">
                    $
                  </span>
                  <input
                    type="number"
                    value={category.budget}
                    onChange={(e) => handleBudgetChange(category.name, e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] placeholder-[#6B7280] focus:outline-none focus:border-[#00A6B2]"
                    min="0"
                    step="1"
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#2A2A2A] rounded-lg text-[#C0C0C0] hover:bg-[#2A2A2A] transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#00A6B2] text-white rounded-lg hover:bg-[#008A94] transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}