'use client';

import React from 'react';
import ProfileCard from '@/components/settings/ProfileCard';
import NotificationSettings from '@/components/settings/NotificationSettings';

const SettingsView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account and app preferences.
        </p>
      </div>

      {/* Profile Settings */}
      <ProfileCard />

      {/* Notification Settings */}
      <NotificationSettings />

      {/* Device Settings */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Manage Devices
        </h2>
        <p className="text-gray-600 mb-6">
          Connect or disconnect appliances from your UrjaSync account.
        </p>
        <button className="bg-blue-50 text-blue-700 font-semibold py-3 px-5 rounded-lg hover:bg-blue-100 w-full md:w-auto">
          Link New Appliance
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
