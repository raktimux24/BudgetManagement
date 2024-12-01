import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useBudget } from '../../contexts/BudgetContext';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    id: string;
    name: string;
    budget: number;
    color: string;
  };
}

interface CategoryFormData {
  name: string;
  budget: number;
  color: string;
}

const colorOptions = [
  { value: '#00A6B2', label: 'Teal' },
  { value: '#C5A900', label: 'Gold' },
  { value: '#6A4C93', label: 'Purple' },
  { value: '#008A94', label: 'Dark Teal' },
  { value: '#B39200', label: 'Dark Gold' },
  { value: '#5A3F7D', label: 'Dark Purple' }
];

export function EditCategoryModal({ isOpen, onClose, category }: EditCategoryModalProps) {
  const { updateCategory } = useBudget();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CategoryFormData>({
    defaultValues: {
      name: category.name,
      budget: category.budget,
      color: category.color
    }
  });

  const selectedColor = watch('color');

  const onSubmit = async (data: CategoryFormData) => {
    try {
      console.log('Submitting category update:', {
        id: category.id,
        updates: {
          name: data.name,
          budget: Number(data.budget),
          color: data.color
        }
      });

      await updateCategory(category.id, {
        name: data.name,
        budget: Number(data.budget),
        color: data.color
      });
      onClose();
    } catch (error) {
      console.error('Failed to update category:', error);
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
              Edit Category
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-[#C0C0C0] hover:text-[#EAEAEA] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
                Category Name
              </label>
              <input
                type="text"
                {...register('name', { required: 'Category name is required' })}
                className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] placeholder-[#6B7280] focus:outline-none focus:border-[#00A6B2]"
                placeholder="e.g., Gaming, Education"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
                Monthly Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('budget', { 
                    required: 'Budget is required',
                    min: { value: 0, message: 'Budget must be positive' },
                    valueAsNumber: true
                  })}
                  className="w-full pl-8 pr-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] placeholder-[#6B7280] focus:outline-none focus:border-[#00A6B2]"
                  placeholder="0.00"
                />
              </div>
              {errors.budget && (
                <p className="mt-1 text-sm text-red-500">{errors.budget.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
                Color
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center justify-center p-2 rounded-lg cursor-pointer
                      ${selectedColor === option.value ? 'ring-2 ring-[#00A6B2]' : ''}
                      hover:bg-[#2A2A2A] transition-colors
                    `}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register('color', { required: 'Color is required' })}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: option.value }}
                      />
                      <span className="text-sm text-[#EAEAEA]">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.color && (
                <p className="mt-1 text-sm text-red-500">{errors.color.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[#EAEAEA] bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#00A6B2] rounded-lg hover:bg-[#008A94] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}