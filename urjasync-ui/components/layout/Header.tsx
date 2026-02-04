'use client';

import React, { useState, useEffect } from 'react';
import BellIcon from '@/components/icons/BellIcon';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  avatar?: string;
}

interface HeaderProps {
  peakStatus: 'Peak Time' | 'Off-Peak';
  user: User | null;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

const PeakStatusIndicator: React.FC<{ status: string }> = ({ status }) => {
  const isPeak = status === 'Peak Time';
  return (
    <div className="flex items-center">
      <span className={`relative flex h-3 w-3 ${isPeak ? 'mr-2' : ''}`}>
        {isPeak && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-3 w-3 ${
            isPeak ? 'bg-red-500' : 'bg-green-500'
          }`}
        ></span>
      </span>
      <span
        className={`ml-3 text-sm font-semibold ${
          isPeak ? 'text-red-600' : 'text-green-700'
        }`}
      >
        {isPeak ? 'Peak Time' : 'Off-Peak'}
      </span>
    </div>
  );
};

// Notification Dropdown Component
const NotificationDropdown: React.FC<{ 
  isOpen: boolean; 
  notifications: Notification[] 
}> = ({ isOpen, notifications }) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    // Here you would normally make an API call
    console.log('Mark as read:', id);
  };

  const markAllAsRead = () => {
    // Here you would normally make an API call
    console.log('Mark all as read');
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === 'success' ? 'bg-green-500' :
                  notification.type === 'warning' ? 'bg-yellow-500' :
                  notification.type === 'error' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(notification.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500">No notifications</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-700 w-full text-center">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ peakStatus, user }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Mock notifications - in real app, this would come from API
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'High Energy Usage Alert',
        message: 'Your AC consumed 30% more energy than usual today',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false
      },
      {
        id: '2',
        title: 'Bill Generated',
        message: 'Your monthly bill of ₹2,450 has been generated',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false
      },
      {
        id: '3',
        title: 'Device Offline',
        message: 'Your Philips TV has been offline for 2 hours',
        type: 'error',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        read: true
      },
      {
        id: '4',
        title: 'Energy Saving Goal Achieved',
        message: 'You saved 15% energy this week! Great job!',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isNotificationOpen) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isNotificationOpen]);

  return (
    <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      {/* Peak Status Indicator */}
      <PeakStatusIndicator status={peakStatus} />

      <div className="flex items-center space-x-6">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 relative"
            onClick={(e) => {
              e.stopPropagation();
              setIsNotificationOpen(!isNotificationOpen);
            }}
          >
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={isNotificationOpen}
            notifications={notifications}
          />
        </div>

        {user && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-lg">
              {user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-800">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
