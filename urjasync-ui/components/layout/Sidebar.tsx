'use client';

import React from 'react';
import HomeIcon from '@/components/icons/HomeIcon';
import CpuChipIcon from '@/components/icons/CpuChipIcon';
import SparklesIcon from '@/components/icons/SparklesIcon';
import ClockIcon from '@/components/icons/ClockIcon';
import CreditCardIcon from '@/components/icons/CreditCardIcon';
import CogIcon from '@/components/icons/CogIcon';
import LogOutIcon from '@/components/icons/LogOutIcon';
import MicrogridIcon from '@/components/icons/MicrogridIcon';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const NavItem: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
      active
        ? 'bg-blue-100 text-blue-700 font-semibold'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
    }`}
  >
    <Icon className="w-5 h-5 mr-3" />
    <span>{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => (
  <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg">
    {/* Logo */}
    <div className="h-20 flex items-center px-8">
      <HomeIcon className="w-8 h-8 text-blue-600" />
      <span className="text-2xl font-bold text-gray-800 ml-3">UrjaSync</span>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-6 py-4 space-y-2">
      <NavItem
        icon={HomeIcon}
        label="Dashboard"
        active={currentPage === 'dashboard'}
        onClick={() => setCurrentPage('dashboard')}
      />
      <NavItem
        icon={CpuChipIcon}
        label="Appliances"
        active={currentPage === 'appliances'}
        onClick={() => setCurrentPage('appliances')}
      />
      <NavItem
        icon={SparklesIcon}
        label="Optimization"
        active={currentPage === 'optimization'}
        onClick={() => setCurrentPage('optimization')}
      />
      <NavItem
        icon={ClockIcon}
        label="Routines"
        active={currentPage === 'routines'}
        onClick={() => setCurrentPage('routines')}
      />
      <NavItem
        icon={CreditCardIcon}
        label="Billing"
        active={currentPage === 'billing'}
        onClick={() => setCurrentPage('billing')}
      />
      <NavItem
        icon={MicrogridIcon}
        label="Microgrid"
        active={currentPage === 'microgrid'}
        onClick={() => setCurrentPage('microgrid')}
      />
      <NavItem
        icon={CogIcon}
        label="Settings"
        active={currentPage === 'settings'}
        onClick={() => setCurrentPage('settings')}
      />
    </nav>

    {/* Footer / Logout */}
    <div className="px-6 py-6">
      <NavItem
        icon={LogOutIcon}
        label="Logout"
        active={false}
        onClick={() => {}}
      />
    </div>
  </div>
);

export default Sidebar;
