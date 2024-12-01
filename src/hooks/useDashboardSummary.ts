import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

interface DashboardSummary {
  totalMonthlySpend: number;
  activeSubscriptions: number;
  upcomingRenewals: number;
  loading: boolean;
}

export function useDashboardSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary>({
    totalMonthlySpend: 0,
    activeSubscriptions: 0,
    upcomingRenewals: 0,
    loading: true,
  });

  useEffect(() => {
    if (user) {
      fetchSummaryData();
    }
  }, [user]);

  const parseDate = (dateStr: string): Date => {
    // Handle DD/MM/YYYY format
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(num => parseInt(num, 10));
      return new Date(year, month - 1, day); // month is 0-based in JS Date
    }
    // Handle ISO format or other formats
    return new Date(dateStr);
  };

  const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
    // Convert all dates to timestamps for comparison
    const dateTime = date.getTime();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    return dateTime >= startTime && dateTime <= endTime;
  };

  const getNextPaymentDate = (currentDate: Date, billingCycle: string): Date => {
    const nextDate = new Date(currentDate);
    
    switch (billingCycle) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    return nextDate;
  };

  const fetchSummaryData = async () => {
    if (!user) return;

    try {
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (subscriptionsError) {
        console.error('Error fetching subscriptions:', subscriptionsError);
        throw subscriptionsError;
      }

      // Force detailed logging of each subscription
      if (subscriptions) {
        console.log('=== SUBSCRIPTION DATA START ===');
        subscriptions.forEach((sub, index) => {
          console.log(`Subscription ${index + 1}:`, JSON.stringify({
            id: sub.id,
            name: sub.name,
            amount: sub.amount,
            billing_cycle: sub.billing_cycle,
            next_billing_date: sub.next_billing_date,
            status: sub.status,
            created_at: sub.created_at,
            updated_at: sub.updated_at
          }, null, 2));
        });
        console.log('=== SUBSCRIPTION DATA END ===');
        console.log('Total active subscriptions:', subscriptions.length);
      } else {
        console.log('No subscriptions found');
      }

      // Calculate upcoming payments in next 30 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      thirtyDaysFromNow.setHours(23, 59, 59, 999);

      console.log('=== DATE RANGE ===');
      console.log('Today:', today.toISOString());
      console.log('30 days from now:', thirtyDaysFromNow.toISOString());

      let upcomingPayments = 0;
      const paymentDetails: any[] = [];

      if (subscriptions) {
        console.log('=== PAYMENT CALCULATION START ===');
        subscriptions.forEach(subscription => {
          if (!subscription.next_billing_date) {
            console.log(`[${subscription.name}] No next billing date`);
            return;
          }

          // Log the raw next_billing_date value
          console.log(`[${subscription.name}] Raw next_billing_date:`, subscription.next_billing_date);

          try {
            const nextBillingDate = parseDate(subscription.next_billing_date);
            
            // Check if date is valid
            if (isNaN(nextBillingDate.getTime())) {
              console.log(`[${subscription.name}] Invalid date format`);
              return;
            }

            console.log(`[${subscription.name}] Parsed next billing date:`, nextBillingDate.toISOString());
            console.log(`[${subscription.name}] Date comparison:`, {
              isAfterToday: nextBillingDate >= today,
              isBeforeThirtyDays: nextBillingDate <= thirtyDaysFromNow
            });

            if (isDateInRange(nextBillingDate, today, thirtyDaysFromNow)) {
              upcomingPayments++;
              paymentDetails.push({
                name: subscription.name,
                date: nextBillingDate.toISOString(),
                amount: subscription.amount
              });
              console.log(`[${subscription.name}] Payment counted - falls within range`);
            } else {
              console.log(`[${subscription.name}] Payment not counted - outside range`);
            }
          } catch (err) {
            console.error(`[${subscription.name}] Error processing date:`, err);
          }
        });
        console.log('=== PAYMENT CALCULATION END ===');
      }

      console.log('=== RESULTS ===');
      console.log('Upcoming payments:', upcomingPayments);
      console.log('Payment details:', paymentDetails);

      setSummary({
        totalMonthlySpend: subscriptions?.reduce((total, sub) => total + (parseFloat(sub.amount) || 0), 0) || 0,
        activeSubscriptions: subscriptions?.length || 0,
        upcomingRenewals: upcomingPayments,
        loading: false,
      });

    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      setSummary(prev => ({ ...prev, loading: false }));
    }
  };

  return summary;
}
