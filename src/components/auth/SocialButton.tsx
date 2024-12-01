import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SocialButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  children: React.ReactNode;
}

export function SocialButton({ icon: Icon, onClick, children }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-[#2A2A2A] rounded-md shadow-sm bg-[#121212] text-[#EAEAEA] hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A6B2] transition-colors"
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </button>
  );
}