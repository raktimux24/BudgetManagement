import React from 'react';
import { Link } from 'react-router-dom';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SubscriptionTable } from '../subscription/SubscriptionTable';

export function SubscriptionList() {
  const { subscriptions, loading, updateSubscription, deleteSubscription } = useSubscriptions();

  const handleStatusChange = async (id: string, status: 'active' | 'inactive') => {
    await updateSubscription(id, { status });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      await deleteSubscription(id);
    }
  };

  const handleEdit = (subscription: any) => {
    // Navigate to edit page will be handled by the table component
  };

  if (loading) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] overflow-hidden animate-pulse">
        <div className="h-16 bg-[#2A2A2A]" />
        <div className="p-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-[#2A2A2A] rounded mb-4 last:mb-0" />
          ))}
        </div>
      </div>
    );
  }

  // Get the 5 most recent subscriptions
  const recentSubscriptions = [...(subscriptions || [])]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);

  return (
    <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] overflow-hidden">
      <h2 className="text-lg font-semibold text-[#EAEAEA] p-6 border-b border-[#2A2A2A]">
        Recent Subscriptions
      </h2>
      
      <SubscriptionTable
        subscriptions={recentSubscriptions}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
      
      {(!subscriptions || subscriptions.length === 0) && (
        <div className="p-8 text-center">
          <p className="text-[#C0C0C0]">No subscriptions added yet.</p>
        </div>
      )}
      
      {subscriptions && subscriptions.length > 5 && (
        <div className="p-4 border-t border-[#2A2A2A] text-center">
          <Link 
            to="/subscriptions" 
            className="text-[#00A6B2] hover:text-[#008A94] transition-colors"
          >
            View All Subscriptions
          </Link>
        </div>
      )}
    </div>
  );
}