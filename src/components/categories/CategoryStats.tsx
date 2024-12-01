import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Card } from '../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function CategoryStats() {
  const { state } = useSubscription();
  const { subscriptions } = state;

  // Calculate category statistics
  const categoryStats = React.useMemo(() => {
    const stats = subscriptions.reduce((acc, subscription) => {
      const { category, amount, billingCycle } = subscription;
      const monthlyAmount = billingCycle === 'yearly' 
        ? amount / 12 
        : billingCycle === 'quarterly'
        ? amount / 3
        : amount;

      acc[category] = (acc[category] || 0) + monthlyAmount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));
  }, [subscriptions]);

  // Colors for the pie chart
  const COLORS = ['#00A6B2', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-[#EAEAEA]">Category Distribution</h2>
      {categoryStats.length > 0 ? (
        <>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-[#C0C0C0] text-sm">
              Total Monthly Spending: ${categoryStats.reduce((sum, stat) => sum + stat.value, 0).toFixed(2)}
            </p>
          </div>
        </>
      ) : (
        <p className="text-[#C0C0C0] text-center py-8">
          No categories found. Add some subscriptions to see statistics.
        </p>
      )}
    </Card>
  );
}
