import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SubscriptionForm } from '../components/subscription/SubscriptionForm';
import { ImportOptions } from '../components/subscription/ImportOptions';
import { SubscriptionLayout } from '../components/subscription/SubscriptionLayout';
import { NotificationService } from '../services/NotificationService'; // Assuming this is where NotificationService is located
import { useNavigate } from 'react-router-dom'; // Assuming you are using react-router-dom v6

export function AddSubscription() {
  const navigate = useNavigate();
  const user = null; // Assuming user is defined somewhere in your code
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [name, setName] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [billingCycle, setBillingCycle] = React.useState('');
  const [nextBillingDate, setNextBillingDate] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!user) throw new Error('User not authenticated');

      const subscriptionData = {
        user_id: user.id,
        name,
        amount: Number(amount),
        billing_cycle: billingCycle,
        category: selectedCategory,
        next_billing_date: nextBillingDate,
        status: 'active',
      };

      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      // Create notification for new subscription
      await NotificationService.createPaymentNotification(subscription);

      navigate('/dashboard', { 
        state: { message: 'Subscription added successfully!' }
      });
    } catch (err) {
      console.error('Error adding subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to add subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-[#EAEAEA] mt-4">Add New Subscription</h1>
          <p className="text-[#C0C0C0] mt-2">Enter the details of your subscription or import from supported providers.</p>
        </div>

        <div className="space-y-8">
          <SubscriptionForm 
            handleSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
            error={error} 
            name={name} 
            amount={amount} 
            billingCycle={billingCycle} 
            nextBillingDate={nextBillingDate} 
            selectedCategory={selectedCategory} 
            setName={setName} 
            setAmount={setAmount} 
            setBillingCycle={setBillingCycle} 
            setNextBillingDate={setNextBillingDate} 
            setSelectedCategory={setSelectedCategory} 
          />
         
        </div>
      </div>
    </SubscriptionLayout>
  );
}