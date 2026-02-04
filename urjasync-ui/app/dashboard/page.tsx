'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import NotificationPopup from '@/components/layout/NotificationPopup';
import DashboardView from '@/components/views/DashboardView';
import AnalyticsView from '@/components/views/AnalyticsView';
import AppliancesView from '@/components/views/AppliancesView';
import OptimizationView from '@/components/views/OptimizationView';
import RoutinesView from '@/components/views/RoutinesView';
import BillingView from '@/components/views/BillingView';
import SettingsView from '@/components/views/SettingsView';
import MicrogridView from '@/components/views/MicrogridView';
import MarketplaceView from '@/components/views/MarketplaceView';
import SustainabilityView from '@/components/views/SustainabilityView';
import MaintenanceView from '@/components/views/MaintenanceView';

const DashboardPage = () => {
  const { isAuthenticated, isClient, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Show loading or null while checking authentication
  if (!isClient) {
    return null;
  }

  if (!isAuthenticated) {
    return null; // Will redirect automatically
  }

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
      case 'analytics':
        return <AnalyticsView />;
      case 'marketplace':
        return <MarketplaceView />;
      case 'sustainability':
        return <SustainabilityView />;
      case 'maintenance':
        return <MaintenanceView />;
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

  // Determine peak status based on current time
  const getPeakStatus = () => {
    const hour = new Date().getHours();
    // Peak hours: 6 PM - 10 PM
    if (hour >= 18 && hour < 22) {
      return 'Peak Time';
    }
    return 'Off-Peak';
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header peakStatus={getPeakStatus()} user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          {renderPage()}
        </main>
      </div>

      <NotificationPopup />
    </div>
  );
};

export default DashboardPage;
