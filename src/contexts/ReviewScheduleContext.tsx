import React, { createContext, useContext, useReducer } from 'react';

interface ReviewSchedule {
  enabled: boolean;
  dayOfWeek: number; // 0-6 for Sunday-Saturday
  weekOfMonth: number; // 1-5 for first-last week
  time: string; // HH:mm format
  lastReviewed?: string; // ISO date string
  nextReview?: string; // ISO date string
}

interface ReviewScheduleState {
  schedule: ReviewSchedule;
}

type ReviewScheduleAction =
  | { type: 'UPDATE_SCHEDULE'; payload: Partial<ReviewSchedule> }
  | { type: 'DISABLE_SCHEDULE' }
  | { type: 'MARK_REVIEWED' };

const initialState: ReviewScheduleState = {
  schedule: {
    enabled: false,
    dayOfWeek: 1, // Monday
    weekOfMonth: 1, // First week
    time: '09:00',
  }
};

function calculateNextReview(schedule: ReviewSchedule): string {
  const now = new Date();
  let date = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Find the first occurrence of the specified day in the month
  while (date.getDay() !== schedule.dayOfWeek) {
    date.setDate(date.getDate() + 1);
  }
  
  // Add weeks to get to the specified week of month
  date.setDate(date.getDate() + (schedule.weekOfMonth - 1) * 7);
  
  // If this date is in the past, move to next month
  if (date < now) {
    date = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    while (date.getDay() !== schedule.dayOfWeek) {
      date.setDate(date.getDate() + 1);
    }
    date.setDate(date.getDate() + (schedule.weekOfMonth - 1) * 7);
  }
  
  // Set the time
  const [hours, minutes] = schedule.time.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  
  return date.toISOString();
}

function reviewScheduleReducer(state: ReviewScheduleState, action: ReviewScheduleAction): ReviewScheduleState {
  switch (action.type) {
    case 'UPDATE_SCHEDULE': {
      const newSchedule = {
        ...state.schedule,
        ...action.payload,
        enabled: true
      };
      return {
        schedule: {
          ...newSchedule,
          nextReview: calculateNextReview(newSchedule)
        }
      };
    }
    case 'DISABLE_SCHEDULE':
      return {
        schedule: {
          ...state.schedule,
          enabled: false,
          nextReview: undefined
        }
      };
    case 'MARK_REVIEWED':
      return {
        schedule: {
          ...state.schedule,
          lastReviewed: new Date().toISOString(),
          nextReview: calculateNextReview(state.schedule)
        }
      };
    default:
      return state;
  }
}

const ReviewScheduleContext = createContext<{
  state: ReviewScheduleState;
  dispatch: React.Dispatch<ReviewScheduleAction>;
} | undefined>(undefined);

export function ReviewScheduleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reviewScheduleReducer, initialState);

  return (
    <ReviewScheduleContext.Provider value={{ state, dispatch }}>
      {children}
    </ReviewScheduleContext.Provider>
  );
}

export function useReviewSchedule() {
  const context = useContext(ReviewScheduleContext);
  if (context === undefined) {
    throw new Error('useReviewSchedule must be used within a ReviewScheduleProvider');
  }
  return context;
}