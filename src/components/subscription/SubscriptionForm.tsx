import React from 'react';
import { useForm } from 'react-hook-form';
import { useSubscriptions, Subscription } from '../../hooks/useSubscriptions';
import { Calendar } from 'lucide-react';
import { CategorySelect } from './CategorySelect';
import { useNavigate } from 'react-router-dom';

type SubscriptionFormData = Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

const BILLING_CYCLES = ['Monthly', 'Yearly', 'Weekly', 'Quarterly'];

interface SubscriptionFormProps {
  subscription?: Subscription;
  mode?: 'add' | 'edit';
}

export function SubscriptionForm({ subscription, mode = 'add' }: SubscriptionFormProps) {
  const { addSubscription, updateSubscription, loading, error } = useSubscriptions();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    defaultValues: mode === 'edit' ? {
      name: subscription?.name || '',
      amount: subscription?.amount || 0,
      billing_cycle: subscription?.billing_cycle || '',
      category: subscription?.category || '',
      next_billing_date: subscription?.next_billing_date ? 
        new Date(subscription.next_billing_date).toISOString().split('T')[0] : '',
      description: subscription?.description || '',
      reminder_days: subscription?.reminder_days ?? 3,
    } : {
      reminder_days: 3
    }
  });

  const navigate = useNavigate();

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      const subscriptionData = {
        name: data.name,
        amount: Number(data.amount),
        billing_cycle: data.billing_cycle,
        category: data.category,
        next_billing_date: new Date(data.next_billing_date),
        description: data.description,
        reminder_days: Number(data.reminder_days),
        status: 'active' as const
      };

      if (mode === 'edit' && subscription?.id) {
        await updateSubscription(subscription.id, subscriptionData);
      } else {
        await addSubscription(subscriptionData);
      }
      
      navigate('/dashboard', {
        state: { 
          message: `Subscription successfully ${mode === 'edit' ? 'updated' : 'added'}!`
        }
      });
    } catch (err) {
      console.error('Error submitting subscription:', err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
      <h2 className="text-lg font-semibold text-[#EAEAEA] mb-6">
        {mode === 'edit' ? 'Edit Subscription' : 'Subscription Details'}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
              Subscription Name
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] placeholder-[#6B7280] focus:outline-none focus:border-[#00A6B2]"
              placeholder="e.g., Netflix, Spotify"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]">
                $
              </span>
              <input
                type="number"
                step="0.01"
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 0, message: 'Amount must be positive' }
                })}
                className="w-full pl-8 pr-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] placeholder-[#6B7280] focus:outline-none focus:border-[#00A6B2]"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
              Billing Cycle
            </label>
            <select
              {...register('billing_cycle', { required: 'Billing cycle is required' })}
              className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
            >
              <option value="">Select billing cycle</option>
              {BILLING_CYCLES.map((cycle) => (
                <option key={cycle} value={cycle.toLowerCase()}>
                  {cycle}
                </option>
              ))}
            </select>
            {errors.billing_cycle && (
              <p className="mt-1 text-sm text-red-500">{errors.billing_cycle.message}</p>
            )}
          </div>

          <CategorySelect register={register} error={errors.category} />

          <div>
            <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
              Next Billing Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
              <input
                type="date"
                {...register('next_billing_date', { required: 'Next billing date is required' })}
                className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
              />
            </div>
            {errors.next_billing_date && (
              <p className="mt-1 text-sm text-red-500">{errors.next_billing_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
              Reminder Days
            </label>
            <input
              type="number"
              {...register('reminder_days', { 
                required: 'Reminder days is required',
                min: { value: 1, message: 'Must be at least 1 day' },
                max: { value: 30, message: 'Must be no more than 30 days' }
              })}
              className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] placeholder-[#6B7280] focus:outline-none focus:border-[#00A6B2]"
              placeholder="e.g., 3"
            />
            {errors.reminder_days && (
              <p className="mt-1 text-sm text-red-500">{errors.reminder_days.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#EAEAEA] mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] placeholder-[#6B7280] focus:outline-none focus:border-[#00A6B2]"
              placeholder="Add any notes or details about this subscription..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-[#2A2A2A] rounded-lg text-[#C0C0C0] hover:bg-[#2A2A2A] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#00A6B2] rounded-lg text-white hover:bg-[#008A94] transition-colors"
          >
            {mode === 'edit' ? 'Update' : 'Add'} Subscription
          </button>
        </div>
      </form>
    </div>
  );
}