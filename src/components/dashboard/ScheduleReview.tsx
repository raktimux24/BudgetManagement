import React, { useState, useEffect } from 'react';
import { Calendar, Bell, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/datepicker.css";

interface ScheduleReviewSettings {
  schedule_review_enabled: boolean;
  schedule_review_frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  last_review_date: string | null;
  next_review_date: string | null;
}

export function ScheduleReview() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ScheduleReviewSettings>({
    schedule_review_enabled: false,
    schedule_review_frequency: 'monthly',
    last_review_date: null,
    next_review_date: null
  });
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Local state for date pickers
  const [lastReviewDate, setLastReviewDate] = useState<Date | null>(null);
  const [nextReviewDate, setNextReviewDate] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  useEffect(() => {
    // Update date picker states when settings change
    setLastReviewDate(settings.last_review_date ? new Date(settings.last_review_date) : null);
    setNextReviewDate(settings.next_review_date ? new Date(settings.next_review_date) : null);
  }, [settings]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('schedule_review_enabled, schedule_review_frequency, last_review_date, next_review_date')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setSettings({
          schedule_review_enabled: data.schedule_review_enabled || false,
          schedule_review_frequency: data.schedule_review_frequency || 'monthly',
          last_review_date: data.last_review_date,
          next_review_date: data.next_review_date
        });
      }
    } catch (error) {
      console.error('Error fetching schedule review settings:', error);
    }
  };

  const calculateNextReviewDate = (frequency: string): Date => {
    const today = new Date();
    let nextDate = new Date();

    switch (frequency) {
      case 'weekly':
        nextDate.setDate(today.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(today.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(today.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(today.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(today.getMonth() + 1); // Default to monthly
    }

    return nextDate;
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    const updates: Partial<ScheduleReviewSettings> = {
      schedule_review_enabled: enabled
    };

    if (enabled) {
      const now = new Date();
      const nextDate = calculateNextReviewDate(settings.schedule_review_frequency);
      setLastReviewDate(now);
      setNextReviewDate(nextDate);
      updates.last_review_date = now.toISOString();
      updates.next_review_date = nextDate.toISOString();
    } else {
      setLastReviewDate(null);
      setNextReviewDate(null);
      updates.last_review_date = null;
      updates.next_review_date = null;
    }

    await updateSettings(updates);
  };

  const handleFrequencyChange = (frequency: ScheduleReviewSettings['schedule_review_frequency']) => {
    setSettings(prev => ({ ...prev, schedule_review_frequency: frequency }));
    setIsDirty(true);
  };

  const handleDateChange = (date: Date | null, type: 'last' | 'next') => {
    if (type === 'last') {
      setLastReviewDate(date);
    } else {
      setNextReviewDate(date);
    }
    setIsDirty(true);
  };

  const handleSave = async () => {
    const updates: Partial<ScheduleReviewSettings> = {
      schedule_review_frequency: settings.schedule_review_frequency,
      last_review_date: lastReviewDate?.toISOString() || null,
      next_review_date: nextReviewDate?.toISOString() || null
    };

    await updateSettings(updates);
    setIsDirty(false);
  };

  const updateSettings = async (updates: Partial<ScheduleReviewSettings>) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        ...updates
      }));

      await fetchSettings();
    } catch (error) {
      console.error('Error updating schedule review settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomDatePickerInput = React.forwardRef<
    HTMLInputElement,
    { value?: string; onClick?: () => void; disabled?: boolean; placeholder: string }
  >(({ value, onClick, disabled, placeholder }, ref) => (
    <input
      type="text"
      className={`w-full h-10 px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2] ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#00A6B2]'
      }`}
      onClick={onClick}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      readOnly
      ref={ref}
    />
  ));

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="h-5 w-5 text-[#00A6B2]" />
        <h2 className="text-lg font-semibold text-[#EAEAEA]">Schedule Review</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-[#C0C0C0]" />
            <span className="text-[#EAEAEA]">Enable Regular Reviews</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.schedule_review_enabled}
              onChange={(e) => handleToggleEnabled(e.target.checked)}
              disabled={loading}
            />
            <div className="w-11 h-6 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A6B2]"></div>
          </label>
        </div>

        {settings.schedule_review_enabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-[#C0C0C0] mb-2">
                Review Frequency
              </label>
              <select
                value={settings.schedule_review_frequency}
                onChange={(e) => handleFrequencyChange(e.target.value as ScheduleReviewSettings['schedule_review_frequency'])}
                className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
                disabled={loading}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#C0C0C0] mb-2">
                  Last Review
                </label>
                <DatePicker
                  selected={lastReviewDate}
                  onChange={(date) => handleDateChange(date, 'last')}
                  customInput={<CustomDatePickerInput placeholder="Select date" />}
                  maxDate={new Date()}
                  disabled={loading}
                  dateFormat="MMMM d, yyyy"
                  showPopperArrow={false}
                  todayButton="Today"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#C0C0C0] mb-2">
                  Next Review
                </label>
                <DatePicker
                  selected={nextReviewDate}
                  onChange={(date) => handleDateChange(date, 'next')}
                  customInput={<CustomDatePickerInput placeholder="Select date" />}
                  minDate={new Date()}
                  disabled={loading}
                  dateFormat="MMMM d, yyyy"
                  showPopperArrow={false}
                  todayButton="Today"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={!isDirty || loading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  !isDirty || loading
                    ? 'bg-[#2A2A2A] text-[#808080] cursor-not-allowed'
                    : 'bg-[#00A6B2] text-white hover:bg-[#008A94]'
                }`}
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
