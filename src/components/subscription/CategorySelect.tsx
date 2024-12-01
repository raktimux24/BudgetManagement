import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { useBudget } from '../../contexts/BudgetContext';

interface CategorySelectProps {
  register: UseFormRegister<any>;
  error?: FieldError;
}

export function CategorySelect({ register, error }: CategorySelectProps) {
  const { state } = useBudget();

  return (
    <div>
      <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
        Category
      </label>
      <select
        {...register('category', { required: 'Please select a category' })}
        className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
      >
        <option value="">Select a category</option>
        {state.categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error.message || 'Please select a category'}
        </p>
      )}
    </div>
  );
}