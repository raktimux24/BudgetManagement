import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
}

export function QuickActionButton({
  icon: Icon,
  label,
  description,
  onClick
}: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 text-left hover:bg-[#2A2A2A] rounded-lg transition-colors group"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-[#2A2A2A] group-hover:bg-[#363636]">
          <Icon className="h-5 w-5 text-[#00A6B2]" />
        </div>
        <div>
          <div className="text-[#EAEAEA] font-medium">{label}</div>
          <div className="text-sm text-[#C0C0C0]">{description}</div>
        </div>
      </div>
    </button>
  );
}