'use client';

import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import UsageChart from '@/components/dashboard/UsageChart';
import Recommendations from '@/components/dashboard/Recommendations';
import ZapIcon from '@/components/icons/ZapIcon';
import CurrencyRupeeIcon from '@/components/icons/CurrencyRupeeIcon';
import LeafIcon from '@/components/icons/LeafIcon';
import SunIcon from '@/components/icons/SunIcon';
import MoonIcon from '@/components/icons/MoonIcon';
import { MOCK_DATA } from '@/lib/mockData';

interface DashboardViewProps {
  onNavigate?: (page: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const isPeak = MOCK_DATA.peakStatus === 'Peak Time';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Hello, User!</h1>
      <p className="text-gray-600">Here's your unified home energy dashboard.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Live Usage"
          value={`${MOCK_DATA.liveUsage} kW`}
          icon={<ZapIcon className="text-blue-500" />}
        />
        <StatCard
          title="Current Tariff"
          value={MOCK_DATA.peakStatus}
          icon={
            isPeak ? (
              <SunIcon className="text-red-500" />
            ) : (
              <MoonIcon className="text-gray-700" />
            )
          }
        />
        <StatCard
          title="Estimated Bill"
          value={`₹${MOCK_DATA.estimatedBill}`}
          icon={<CurrencyRupeeIcon className="text-gray-700" />}
        />
        <StatCard
          title="Monthly Savings"
          value={`₹${MOCK_DATA.totalSavings}`}
          icon={<LeafIcon className="text-green-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Chart + Top Appliances) */}
        <div className="lg:col-span-2 space-y-6">
          <UsageChart data={MOCK_DATA.usageHistory} />
        </div>

        {/* Side Panel (Recommendations) */}
        <div className="lg:col-span-1 space-y-6">
          <Recommendations recommendations={MOCK_DATA.recommendations} />
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">My Routines</h2>
            <div className="space-y-3">
              {MOCK_DATA.routines.slice(0, 2).map((routine) => (
                <div key={routine.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{routine.name}</h3>
                    <p className="text-sm text-gray-500">{routine.trigger}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">Run</button>
                </div>
              ))}
              <button
                onClick={() => onNavigate?.('routines')}
                className="text-sm font-medium text-blue-600 w-full text-left mt-2"
              >
                View All Routines →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
