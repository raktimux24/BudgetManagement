import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, Notification } from '../../hooks/useNotifications';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification
  } = useNotifications();

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAll();
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    
    if (notification.related_id) {
      switch (notification.type) {
        case 'payment':
        case 'renewal':
          navigate(`/subscription/${notification.related_id}`);
          break;
        case 'budget':
          navigate('/budget');
          break;
        case 'cancellation':
          navigate('/subscriptions');
          break;
      }
      onClose();
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return diffInHours === 0 
        ? 'Just now'
        : `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 overflow-hidden z-50"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Dialog.Overlay className="absolute inset-0 bg-black bg-opacity-50" />
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-[#1A1A1A] shadow-xl">
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-6">
                  <div className="flex items-start justify-between">
                    <Dialog.Title className="text-2xl font-semibold text-white flex items-center gap-2">
                      <Bell className="h-6 w-6" />
                      Notifications
                    </Dialog.Title>
                    <div className="ml-3 h-7 flex items-center">
                      <button
                        type="button"
                        className="rounded-md text-gray-400 hover:text-gray-300 focus:outline-none"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close panel</span>
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between mb-4">
                      <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-400"
                      >
                        <Check className="h-4 w-4" />
                        Mark all as read
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear all
                      </button>
                    </div>

                    {loading ? (
                      <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No notifications
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 rounded-lg cursor-pointer transition-colors ${
                              notification.is_read
                                ? 'bg-[#2A2A2A] hover:bg-[#333333]'
                                : 'bg-[#2A2A2A] border-l-4 border-blue-500 hover:bg-[#333333]'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-sm font-medium text-white">
                                  {notification.title}
                                </h3>
                                <p className="mt-1 text-sm text-gray-400">
                                  {notification.message}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {formatTimestamp(notification.created_at)}
                                </p>
                              </div>
                              <button
                                onClick={(e) => handleDeleteNotification(e, notification.id)}
                                className="text-gray-400 hover:text-gray-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}