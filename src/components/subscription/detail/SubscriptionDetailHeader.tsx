import React from 'react';
import { ArrowLeft, Edit2, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSubscriptionDetail } from '../../../hooks/useSubscriptionDetail';
import { formatCurrency } from '../../../utils/formatters';

export function SubscriptionDetailHeader() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { subscription, loading, error } = useSubscriptionDetail(id || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#00A6B2]" />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load subscription details</p>
        <Link 
          to="/dashboard" 
          className="inline-flex items-center mt-4 text-[#C0C0C0] hover:text-[#00A6B2] transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const getDaysUntilNextPayment = () => {
    const nextPaymentDate = new Date(subscription.next_billing_date);
    const today = new Date();
    const diffTime = nextPaymentDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = () => {
    switch (subscription.status) {
      case 'active':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      case 'paused':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-[#C0C0C0] hover:text-[#00A6B2] transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#EAEAEA]">{subscription.name}</h1>
              <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor()} bg-opacity-10`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              {subscription.category && (
                <span className="text-[#C0C0C0]">
                  {subscription.category}
                </span>
              )}
              <span className="text-[#C0C0C0]">
                {formatCurrency(subscription.amount)} / {subscription.billing_cycle}
              </span>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <button
              onClick={() => navigate(`/edit-subscription/${subscription.id}`)}
              className="inline-flex items-center px-4 py-2 bg-[#2A2A2A] rounded-lg text-[#EAEAEA] hover:bg-[#363636] transition-colors"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Subscription
            </button>
            
            {subscription.status === 'active' && (
              <div className="flex items-center text-[#00A6B2]">
                <AlertCircle className="h-5 w-5 mr-2" />
                Next payment in {getDaysUntilNextPayment()} days
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}