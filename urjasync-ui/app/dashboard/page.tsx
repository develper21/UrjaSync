'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import NotificationPopup from '@/components/layout/NotificationPopup';
import DashboardView from '@/components/views/DashboardView';
import AppliancesView from '@/components/views/AppliancesView';
import OptimizationView from '@/components/views/OptimizationView';
import RoutinesView from '@/components/views/RoutinesView';
import BillingView from '@/components/views/BillingView';
import SettingsView from '@/components/views/SettingsView';
import MicrogridView from '@/components/views/MicrogridView';
import { MOCK_DATA } from '@/lib/mockData';

const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null; // Will redirect automatically
  }

  const [currentPage, setCurrentPage] = React.useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentPage} />;
      case 'appliances':
        return <AppliancesView />;
      case 'optimization':
        return <OptimizationView />;
      case 'routines':
        return <RoutinesView />;
      case 'billing':
        return <BillingView />;
      case 'microgrid':
        return <MicrogridView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header peakStatus={MOCK_DATA.peakStatus} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          {renderPage()}
        </main>
      </div>

      <NotificationPopup />
    </div>
  );
};

export default DashboardPage;
