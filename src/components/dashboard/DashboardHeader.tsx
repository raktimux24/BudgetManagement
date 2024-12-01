import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { Bell, Settings, LogOut, CreditCard, Menu as MenuIcon, X } from 'lucide-react';
import { NotificationsPanel } from '../notifications/NotificationsPanel';
import { useSettings } from '../../contexts/SettingsContext';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useNotifications } from '../../hooks/useNotifications';

export function DashboardHeader() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = React.useState(false);
  const { profile, loading } = useSettings();
  const { signOut } = useSupabaseAuth();
  const { notifications } = useNotifications();

  const unreadCount = notifications?.filter(n => !n.is_read).length ?? 0;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const defaultProfilePicture = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=32&h=32&q=80";

  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Profile image load error. URL:', e.currentTarget.src);
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    console.log('Profile image loaded successfully');
    setImageError(false);
    setIsLoading(false);
  };

  const isValidImageUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.pathname.includes('/profile-pictures/') && !parsedUrl.pathname.includes('/profile-pictures/profile-pictures/');
    } catch {
      return false;
    }
  };

  React.useEffect(() => {
    if (profile?.profile_picture) {
      setImageError(false);
      setIsLoading(true);
    }
  }, [profile?.profile_picture]);

  // Close mobile menu when location changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/dashboard', label: 'Overview' },
    { path: '/subscriptions', label: 'Subscriptions' },
    { path: '/budget', label: 'Budget' },
    { path: '/categories', label: 'Categories' },
  ];

  return (
    <header className="bg-[#1A1A1A] border-b border-[#2A2A2A] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <CreditCard className="h-8 w-8 text-[#00A6B2]" />
              <span className="ml-2 text-xl font-bold text-[#EAEAEA]">SubscriptionMaster</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`${
                  isActive(path)
                    ? 'text-[#00A6B2]'
                    : 'text-[#C0C0C0] hover:text-[#00A6B2]'
                } transition-colors`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsNotificationsPanelOpen(true)}
              className="relative text-[#C0C0C0] hover:text-[#00A6B2] transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 text-xs flex items-center justify-center bg-[#00A6B2] text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-[#C0C0C0] hover:text-[#00A6B2] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>

            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 focus:outline-none">
                {loading ? (
                  <div className="h-8 w-8 rounded-full bg-[#2A2A2A] animate-pulse" />
                ) : (
                  <div className="relative h-8 w-8">
                    {profile?.profile_picture && !imageError ? (
                      <>
                        <img
                          src={profile.profile_picture}
                          alt={`${profile.name || profile.email}'s profile`}
                          className={`h-8 w-8 rounded-full object-cover ${
                            isLoading ? 'opacity-0' : 'opacity-100'
                          } transition-opacity duration-200`}
                          onError={handleImageError}
                          onLoad={handleImageLoad}
                        />
                        {isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                            <div className="w-5 h-5 border-2 border-[#00A6B2] border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-white text-sm font-medium">
                        {profile?.name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                )}
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md shadow-lg py-1 z-10">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/settings"
                      className={`${active ? 'bg-[#2A2A2A]' : ''} flex items-center w-full px-4 py-2 text-[#C0C0C0]`}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={signOut}
                      className={`${active ? 'bg-[#2A2A2A]' : ''} flex items-center w-full px-4 py-2 text-[#C0C0C0]`}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'max-h-64 opacity-100 mt-4'
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <nav className="flex flex-col space-y-2 py-2">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`${
                  isActive(path)
                    ? 'text-[#00A6B2] bg-[#2A2A2A]'
                    : 'text-[#C0C0C0] hover:text-[#00A6B2] hover:bg-[#2A2A2A]'
                } px-4 py-2 rounded-lg transition-colors`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <NotificationsPanel
        isOpen={isNotificationsPanelOpen}
        onClose={() => setIsNotificationsPanelOpen(false)}
      />
    </header>
  );
}