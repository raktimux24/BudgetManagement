import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { SubscriptionForm } from '../components/subscription/SubscriptionForm';
import { SubscriptionLayout } from '../components/subscription/SubscriptionLayout';
import { useSubscriptionDetail } from '../hooks/useSubscriptionDetail';

export function EditSubscription() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subscription, loading, error } = useSubscriptionDetail(id || '');

  if (loading) {
    return (
      <SubscriptionLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#2A2A2A] rounded w-1/4"></div>
            <div className="h-[400px] bg-[#2A2A2A] rounded"></div>
          </div>
        </div>
      </SubscriptionLayout>
    );
  }

  if (error || !subscription) {
    navigate('/dashboard');
    return null;
  }

  return (
    <SubscriptionLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-[#C0C0C0] hover:text-[#00A6B2] transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-[#EAEAEA] mt-4">Edit Subscription</h1>
          <p className="text-[#C0C0C0] mt-2">Update the details of your subscription.</p>
        </div>

        <div className="space-y-8">
          <SubscriptionForm subscription={subscription} mode="edit" />
        </div>
      </div>
    </SubscriptionLayout>
  );
}