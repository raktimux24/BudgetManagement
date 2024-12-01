import React, { createContext, useContext, useReducer } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'renewal' | 'cancellation' | 'budget';
  timestamp: number;
  isRead: boolean;
  relatedId?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      // Check if notification already exists
      if (state.notifications.some(n => n.id === action.payload.id)) {
        return state;
      }
      return {
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    }

    case 'MARK_AS_READ':
      return {
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, isRead: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case 'MARK_ALL_AS_READ':
      return {
        notifications: state.notifications.map(notif => ({ ...notif, isRead: true })),
        unreadCount: 0
      };

    case 'DELETE_NOTIFICATION':
      return {
        notifications: state.notifications.filter(notif => notif.id !== action.payload),
        unreadCount: state.unreadCount - (
          state.notifications.find(n => n.id === action.payload)?.isRead ? 0 : 1
        )
      };

    case 'CLEAR_ALL':
      return initialState;

    default:
      return state;
  }
}

const NotificationContext = createContext<{
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
} | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  return (
    <NotificationContext.Provider value={{ state, dispatch }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}