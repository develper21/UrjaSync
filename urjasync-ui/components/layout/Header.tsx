'use client';

import React from 'react';
import BellIcon from '@/components/icons/BellIcon';

interface HeaderProps {
  peakStatus: 'Peak Time' | 'Off-Peak';
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

const Header: React.FC<HeaderProps> = ({ peakStatus }) => (
  <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
    {/* Peak Status Indicator */}
    <PeakStatusIndicator status={peakStatus} />

    <div className="flex items-center space-x-6">
      <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700">
        <BellIcon className="w-6 h-6" />
      </button>
      <div className="flex items-center space-x-3">
        <img
          className="w-10 h-10 rounded-full"
          src="https://placehold.co/100x100/E2E8F0/4A5568?text=U"
          alt="User Avatar"
        />
        <div>
          <div className="font-semibold text-gray-800">Demo User</div>
          <div className="text-sm text-gray-500">user@urjasync.com</div>
        </div>
      </div>
    </div>
  </div>
);

export default Header;
