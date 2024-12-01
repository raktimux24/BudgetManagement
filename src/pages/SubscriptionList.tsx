import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionLayout } from '../components/subscription/SubscriptionLayout';
import { SubscriptionListHeader } from '../components/subscription/SubscriptionListHeader';
import { SubscriptionTable } from '../components/subscription/SubscriptionTable';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { Plus } from 'lucide-react';

export function SubscriptionList() {
  const navigate = useNavigate();
  const { subscriptions, loading, updateSubscription, deleteSubscription } = useSubscriptions();
  const [searchTerm, setSearchTerm] = useState('');

  const handleStatusChange = async (id: string, status: 'active' | 'inactive') => {
    await updateSubscription(id, { status });
  };

  const handleEdit = (subscription: any) => {
    navigate(`/edit-subscription/${subscription.id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      await deleteSubscription(id);
    }
  };

  const filteredSubscriptions = (subscriptions || []).filter(subscription => {
    const searchLower = searchTerm.toLowerCase();
    return (
      subscription.name.toLowerCase().includes(searchLower) ||
      subscription.category.toLowerCase().includes(searchLower) ||
      subscription.status?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <SubscriptionLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#2A2A2A] rounded w-1/4"></div>
            <div className="h-[400px] bg-[#2A2A2A] rounded"></div>
          </div>
        </div>
      </SubscriptionLayout>
    );
  }

  return (
    <SubscriptionLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#EAEAEA]">All Subscriptions</h1>
          <button 
            onClick={() => navigate('/add-subscription')}
            className="flex items-center gap-2 px-4 py-2 bg-[#00A6B2] text-white rounded-lg hover:bg-[#008A94] transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Subscription
          </button>
        </div>

        <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] overflow-visible">
          <SubscriptionListHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterClick={() => {}}
            onSortClick={() => {}}
          />
          
          <SubscriptionTable
            subscriptions={filteredSubscriptions}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          
          {filteredSubscriptions.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-[#C0C0C0]">
                {searchTerm ? 'No subscriptions match your search.' : 'No subscriptions added yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </SubscriptionLayout>
  );
}