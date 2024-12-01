import { useState } from 'react';

export function useQuickActions() {
  const [isRenewalsOpen, setIsRenewalsOpen] = useState(false);

  const openRenewals = () => setIsRenewalsOpen(true);
  const closeRenewals = () => setIsRenewalsOpen(false);

  return {
    isRenewalsOpen,
    openRenewals,
    closeRenewals,
  };
}