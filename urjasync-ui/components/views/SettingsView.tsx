'use client';

import React, { useState } from 'react';
import ProfileCard from '@/components/settings/ProfileCard';
import NotificationSettings from '@/components/settings/NotificationSettings';
import LogoutSettings from '@/components/settings/LogoutSettings';

// Custom SVG Icons
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const SmartphoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const HelpCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SettingsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  const settingsSections = [
    { id: 'profile', name: 'Profile', icon: UserIcon, description: 'Manage your personal information' },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, description: 'Configure notification preferences' },
    { id: 'security', name: 'Security', icon: ShieldIcon, description: 'Password and authentication settings' },
    { id: 'devices', name: 'Devices', icon: SmartphoneIcon, description: 'Manage connected appliances' },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon, description: 'Payment methods and billing history' },
    { id: 'help', name: 'Help & Support', icon: HelpCircleIcon, description: 'Get help and contact support' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileCard />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <LogoutSettings />;
      case 'devices':
        return <DeviceSettings onOpenModal={() => setIsDeviceModalOpen(true)} />;
      case 'billing':
        return <BillingSettings />;
      case 'help':
        return <HelpSettings />;
      default:
        return <ProfileCard />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account and app preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-80">
          <nav className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-sm text-gray-500">{section.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>

      {/* Device Modal */}
      <DeviceModal 
        isOpen={isDeviceModalOpen} 
        onClose={() => setIsDeviceModalOpen(false)} 
      />
    </div>
  );
};

// Device Settings Component
const DeviceSettings: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
  const [devices] = useState([
    { id: 1, name: 'Samsung AC', type: 'Air Conditioner', status: 'online', lastSeen: '2 mins ago' },
    { id: 2, name: 'LG Refrigerator', type: 'Refrigerator', status: 'online', lastSeen: '5 mins ago' },
    { id: 3, name: 'Philips TV', type: 'Television', status: 'offline', lastSeen: '2 hours ago' },
  ]);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Connected Devices</h2>
        <button
          onClick={onOpenModal}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Device
        </button>
      </div>

      <div className="space-y-4">
        {devices.map((device) => (
          <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <div>
                <div className="font-medium">{device.name}</div>
                <div className="text-sm text-gray-500">{device.type} • Last seen: {device.lastSeen}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="text-blue-600 hover:text-blue-700">Configure</button>
              <button className="text-red-600 hover:text-red-700">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Billing Settings Component
const BillingSettings: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-6">Billing & Payments</h2>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Current Plan</h3>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">Premium Plan</div>
              <div className="text-sm text-gray-500">₹299/month • Unlimited devices</div>
            </div>
            <button className="text-blue-600 hover:text-blue-700">Change Plan</button>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Payment Method</h3>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">•••• 4242</div>
              <div className="text-sm text-gray-500">Expires 12/25</div>
            </div>
            <button className="text-blue-600 hover:text-blue-700">Update</button>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Billing History</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>January 2024</span>
              <span>₹299</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>December 2023</span>
              <span>₹299</span>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-700 mt-2 text-sm">View All</button>
        </div>
      </div>
    </div>
  );
};

// Help Settings Component
const HelpSettings: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-6">Help & Support</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="font-medium mb-2">Getting Started</h3>
          <p className="text-sm text-gray-600">Learn the basics of UrjaSync</p>
        </div>
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="font-medium mb-2">User Guide</h3>
          <p className="text-sm text-gray-600">Complete documentation</p>
        </div>
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="font-medium mb-2">FAQs</h3>
          <p className="text-sm text-gray-600">Frequently asked questions</p>
        </div>
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="font-medium mb-2">Contact Support</h3>
          <p className="text-sm text-gray-600">Get help from our team</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Need immediate help?</h3>
        <p className="text-blue-700 text-sm mb-3">Our support team is available 24/7</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Start Live Chat
        </button>
      </div>
    </div>
  );
};

// Device Modal Component
const DeviceModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const deviceTypes = [
    'Air Conditioner', 'Refrigerator', 'Washing Machine', 'Television',
    'Microwave', 'Dishwasher', 'Water Heater', 'Smart Lights'
  ];

  const handleAddDevice = async () => {
    if (!deviceName || !deviceType) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Device added successfully!');
      setDeviceName('');
      setDeviceType('');
      onClose();
    } catch (error) {
      alert('Failed to add device');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Add New Device</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Device Name</label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g., Living Room AC"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select device type</option>
              {deviceTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleAddDevice}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Adding...' : 'Add Device'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
