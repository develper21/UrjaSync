'use client';

import React, { useState } from 'react';
import ToggleSwitch from '@/components/appliances/ToggleSwitch';

const NotificationSettings: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [optimizationReports, setOptimizationReports] = useState('Daily');
  const [applianceAlerts, setApplianceAlerts] = useState('Instantly');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      emailNotifications,
      optimizationReports,
      applianceAlerts,
    });
    // TODO: Wire up with Supabase
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-6">Notification Settings</h2>
      <form onSubmit={handleSave} className="space-y-8">
        {/* Email Notifications Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-800">Enable Email Notifications</h3>
            <p className="text-sm text-gray-600 mt-1">
              Receive email updates about your energy usage and recommendations
            </p>
          </div>
          <ToggleSwitch
            enabled={emailNotifications}
            setEnabled={setEmailNotifications}
          />
        </div>

        {/* Optimization Reports */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Optimization Reports</h3>
          <div className="space-y-3">
            {['Every 12 hours', 'Daily', 'Never'].map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="optimizationReports"
                  value={option}
                  checked={optimizationReports === option}
                  onChange={(e) => setOptimizationReports(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Appliance Alerts */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Appliance Alerts</h3>
          <div className="space-y-3">
            {['Instantly', 'Hourly', '12-hour digest'].map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="applianceAlerts"
                  value={option}
                  checked={applianceAlerts === option}
                  onChange={(e) => setApplianceAlerts(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="text-right border-t pt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-blue-700"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings;
