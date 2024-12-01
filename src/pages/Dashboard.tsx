import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardFooter } from '../components/dashboard/DashboardFooter';
import { SummaryWidgets } from '../components/dashboard/SummaryWidgets';
import { SpendingChart } from '../components/dashboard/SpendingChart';
import { SubscriptionList } from '../components/dashboard/SubscriptionList';
import { QuickActions } from '../components/dashboard/QuickActions';
import { ScheduleReview } from '../components/dashboard/ScheduleReview';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useAuth } from '../contexts/AuthContext';
import { NotificationService } from '../services/notificationService';
import { Plus } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions();
  const { user } = useAuth();

  useEffect(() => {
    if (!subscriptionsLoading && subscriptions && user) {
      // Check for upcoming payments and renewals
      NotificationService.checkAndCreatePaymentNotifications(subscriptions);
      NotificationService.checkAndCreateRenewalNotifications(subscriptions);

      // Calculate total monthly spend and check budget
      const monthlySpend = subscriptions.reduce((total, sub) => {
        if (sub.status !== 'active') return total;
        
        let monthlyAmount = sub.amount;
        switch (sub.billing_cycle) {
          case 'yearly':
            monthlyAmount /= 12;
            break;
          case 'quarterly':
            monthlyAmount /= 3;
            break;
          case 'weekly':
            monthlyAmount *= 4.33;
            break;
        }
        return total + monthlyAmount;
      }, 0);

      // Example budget limit - you might want to make this configurable
      const budgetLimit = 500;
      NotificationService.checkBudgetAndNotify(user.id, monthlySpend, budgetLimit);
    }
  }, [subscriptions, subscriptionsLoading, user]);

  const handleAddSubscription = () => {
    navigate('/add-subscription');
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col relative">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00A6B2]/5 via-transparent to-[#6A4C93]/5 pointer-events-none" />
      
      <div className="relative flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-[#EAEAEA]">Dashboard Overview</h1>
            <button 
              onClick={handleAddSubscription}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#00A6B2] text-white rounded-lg hover:bg-[#008A94] transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span className="whitespace-nowrap">Add Subscription</span>
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <SummaryWidgets />
            
            <div className="bg-[#1A1A1A] rounded-lg p-4 sm:p-6 border border-[#2A2A2A]">
              <SpendingChart />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <div className="bg-[#1A1A1A] rounded-lg p-4 sm:p-6 border border-[#2A2A2A]">
                <QuickActions />
              </div>
              <div className="bg-[#1A1A1A] rounded-lg p-4 sm:p-6 border border-[#2A2A2A]">
                <ScheduleReview />
              </div>
            </div>
            
            <div className="bg-[#1A1A1A] rounded-lg p-4 sm:p-6 border border-[#2A2A2A]">
              <SubscriptionList />
            </div>
          </div>
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}