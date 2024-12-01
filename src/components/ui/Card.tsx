import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-[#1E1E1E] border border-[#333333] shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
