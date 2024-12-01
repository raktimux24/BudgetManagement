import React, { useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSubscriptions } from '../../hooks/useSubscriptions';

export function SpendingChart() {
  const { subscriptions, loading } = useSubscriptions();

  useEffect(() => {
    if (subscriptions?.length) {
      console.log('SpendingChart - Subscriptions loaded:', 
        subscriptions.map(sub => ({
          name: sub.name,
          amount: sub.amount,
          billing_cycle: sub.billing_cycle,
          created_at: sub.created_at
        }))
      );
    }
  }, [subscriptions]);

  const calculateMonthlySpending = () => {
    if (loading || !subscriptions?.length) {
      console.log('No data to calculate:', { loading, subscriptionsCount: subscriptions?.length });
      return [];
    }

    // Generate months array for the last 6 months
    const months = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start from first of month

    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo);
      date.setMonth(sixMonthsAgo.getMonth() + i);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        amount: 0,
        date: new Date(date) // Create new date object to avoid reference issues
      });
    }

    console.log('Initial months array:', months);

    // Calculate monthly spending for each subscription
    subscriptions.forEach(subscription => {
      if (subscription.status !== 'active') {
        return;
      }

      const amount = Number(subscription.amount) || 0;
      let monthlyAmount = amount;

      // Convert amount to monthly based on billing cycle
      switch (subscription.billing_cycle?.toLowerCase()) {
        case 'yearly':
          monthlyAmount = amount / 12;
          break;
        case 'quarterly':
          monthlyAmount = amount / 3;
          break;
        case 'weekly':
          monthlyAmount = amount * 4.33; // Average weeks in a month
          break;
        // Monthly is default, no conversion needed
      }

      console.log(`Processing subscription: ${subscription.name}`, {
        originalAmount: amount,
        monthlyAmount,
        billing_cycle: subscription.billing_cycle
      });

      // Add monthly amount to each applicable month
      months.forEach(monthData => {
        const subscriptionStart = new Date(subscription.created_at);
        subscriptionStart.setHours(0, 0, 0, 0); // Normalize to start of day
        
        const monthStart = new Date(monthData.date);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        
        const monthEnd = new Date(monthData.date);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0); // Last day of month
        monthEnd.setHours(23, 59, 59, 999);

        if (subscriptionStart <= monthEnd) {
          monthData.amount += monthlyAmount;
          console.log(`Added ${monthlyAmount} to ${monthData.month} ${monthData.year}, total: ${monthData.amount}`);
        }
      });
    });

    // Sort months chronologically and format for chart
    const chartData = months
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(month => ({
        month: `${month.month} ${month.year}`,
        amount: Number(month.amount.toFixed(2))
      }));

    console.log('Final chart data:', JSON.stringify(chartData, null, 2));
    return chartData;
  };

  if (loading) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A] h-[500px] animate-pulse">
        <div className="h-6 bg-[#2A2A2A] rounded w-48 mb-6" />
        <div className="h-[400px] bg-[#2A2A2A] rounded" />
      </div>
    );
  }

  const data = calculateMonthlySpending();

  if (!data.length) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A] h-[500px] flex flex-col items-center justify-center">
        <p className="text-[#C0C0C0] text-lg mb-2">No spending data available</p>
        <p className="text-[#808080] text-sm">Add some active subscriptions to see your spending trends</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A] h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#EAEAEA]">Spending Trends</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#00A6B2] mr-2" />
            <span className="text-sm text-[#C0C0C0]">Monthly Spend</span>
          </div>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00A6B2" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#00A6B2" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis 
              dataKey="month" 
              stroke="#C0C0C0"
              tick={{ fill: '#C0C0C0' }}
              height={60}
              tickFormatter={(value) => value.split(' ')[0]} // Show only month name
            />
            <YAxis 
              stroke="#C0C0C0"
              tick={{ fill: '#C0C0C0' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #2A2A2A',
                borderRadius: '4px'
              }}
              formatter={(value) => [`$${value}`, 'Amount']}
              labelStyle={{ color: '#EAEAEA' }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#00A6B2"
              fill="url(#colorAmount)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-[#2A2A2A] p-4 rounded-lg">
          <p className="text-[#C0C0C0] text-sm mb-1">Average Monthly Spend</p>
          <p className="text-[#EAEAEA] text-lg font-semibold">
            ${(data.reduce((sum, month) => sum + month.amount, 0) / data.length).toFixed(2)}
          </p>
        </div>
        <div className="bg-[#2A2A2A] p-4 rounded-lg">
          <p className="text-[#C0C0C0] text-sm mb-1">Trend</p>
          <p className="text-[#EAEAEA] text-lg font-semibold">
            {data.length >= 2 
              ? data[data.length - 1].amount > data[data.length - 2].amount 
                ? '↑ Increasing' 
                : '↓ Decreasing'
              : '-'
            }
          </p>
        </div>
      </div>
    </div>
  );
}