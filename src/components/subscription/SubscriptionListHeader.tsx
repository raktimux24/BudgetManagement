import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface SubscriptionListHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  onSortClick: () => void;
}

export function SubscriptionListHeader({
  searchTerm,
  onSearchChange,
  onFilterClick,
  onSortClick
}: SubscriptionListHeaderProps) {
  return (
    <div className="p-6 border-b border-[#2A2A2A]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#C0C0C0]" />
          <input
            type="text"
            placeholder="Search by name, category, or status..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] placeholder-[#C0C0C0] focus:outline-none focus:border-[#00A6B2]"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onFilterClick}
            className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] rounded-lg text-[#C0C0C0] hover:bg-[#363636] transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button 
            onClick={onSortClick}
            className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] rounded-lg text-[#C0C0C0] hover:bg-[#363636] transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </button>
        </div>
      </div>
    </div>
  );
}