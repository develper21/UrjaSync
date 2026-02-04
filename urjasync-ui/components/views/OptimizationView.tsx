'use client';

import React from 'react';
import TariffCard from '@/components/optimization/TariffCard';

interface TariffPeriod {
  id: number;
  period: string;
  rate: number;
  type: 'Off-Peak' | 'Standard' | 'Peak';
  icon: React.ReactNode;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  cta: string;
}

const OptimizationView: React.FC = () => {
  // Mock tariff data - in real app this would come from API
  const tariffs: TariffPeriod[] = [
    {
      id: 1,
      period: '10 PM - 6 AM',
      rate: 3.5,
      type: 'Off-Peak',
      icon: null,
    },
    {
      id: 2,
      period: '6 AM - 6 PM',
      rate: 5.8,
      type: 'Standard',
      icon: null,
    },
    {
      id: 3,
      period: '6 PM - 10 PM',
      rate: 8.2,
      type: 'Peak',
      icon: null,
    },
  ];

  // Mock recommendations - in real app this would come from API
  const recommendations: Recommendation[] = [
    {
      id: 'rec1',
      title: 'Optimize AC Usage',
      description: 'Your AC is consuming more energy than usual. Consider adjusting temperature.',
      cta: 'Adjust Settings',
    },
    {
      id: 'rec2',
      title: 'Peak Hour Savings',
      description: 'Shift heavy appliance usage to off-peak hours to save on electricity bills.',
      cta: 'View Schedule',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Optimization Engine</h1>
        <p className="text-gray-600 mt-1">
          Save money by using energy at the right time.
        </p>
      </div>

      {/* ToD Tariff Card */}
      <TariffCard tariffs={tariffs} />

      {/* Recommendations Card */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Actionable Recommendations
        </h2>
        <div className="space-y-6">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-col md:flex-row items-center justify-between p-6 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {rec.title}
                </h3>
                <p className="text-gray-600">{rec.description}</p>
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {rec.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptimizationView;
