import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, AlertCircle } from 'lucide-react';
import { useSubscription } from '../../../contexts/SubscriptionContext';
import { getUpcomingRenewals } from '../../../utils/subscriptionCalculations';

interface RenewalsListProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RenewalsList({ isOpen, onClose }: RenewalsListProps) {
  const { subscriptions = [], loading } = useSubscription();

  if (loading) {
    return (
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <div className="relative bg-[#1A1A1A] rounded-lg w-full max-w-md p-6 animate-pulse">
            <div className="h-6 bg-[#2A2A2A] rounded w-48 mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-[#2A2A2A] rounded" />
              ))}
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  const upcomingRenewals = getUpcomingRenewals(subscriptions);

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
              Upcoming Renewals
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-[#C0C0C0] hover:text-[#EAEAEA] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {upcomingRenewals.length > 0 ? (
            <div className="space-y-4">
              {upcomingRenewals.map((renewal) => (
                <div
                  key={renewal.id}
                  className="p-4 bg-[#2A2A2A] rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[#EAEAEA] font-medium">{renewal.name}</h4>
                      <p className="text-sm text-[#C0C0C0] mt-1">
                        Renews on {new Date(renewal.nextPayment).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium text-[#00A6B2] mt-2">
                        ${renewal.amount} / {renewal.billingCycle}
                      </p>
                    </div>
                    <AlertCircle className="h-5 w-5 text-[#00A6B2]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-[#C0C0C0]">No upcoming renewals in the next 30 days</p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}