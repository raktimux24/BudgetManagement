import React from 'react';
import { Dialog } from '@headlessui/react';
import { AlertTriangle, X } from 'lucide-react';
import { useBudget } from '../../contexts/BudgetContext';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
}

export function DeleteCategoryModal({ isOpen, onClose, categoryId, categoryName }: DeleteCategoryModalProps) {
  const { deleteCategory } = useBudget();

  const handleDelete = async () => {
    try {
      await deleteCategory(categoryId);
      onClose();
    } catch (error) {
      console.error('Failed to delete category:', error);
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
              Delete Category
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-[#C0C0C0] hover:text-[#EAEAEA] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-400/10 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-[#EAEAEA] text-center">
              Are you sure you want to delete the category "{categoryName}"?
            </p>
            <p className="text-[#C0C0C0] text-sm text-center mt-2">
              This action cannot be undone. All subscriptions in this category will need to be reassigned.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#2A2A2A] rounded-lg text-[#C0C0C0] hover:bg-[#2A2A2A] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Category
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}