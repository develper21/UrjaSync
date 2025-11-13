'use client';

import React from 'react';
import TariffCard from '@/components/optimization/TariffCard';
import { MOCK_DATA } from '@/lib/mockData';

const OptimizationView: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Optimization Engine</h1>
        <p className="text-gray-600 mt-1">
          Save money by using energy at the right time.
        </p>
      </div>

      {/* ToD Tariff Card */}
      <TariffCard tariffs={MOCK_DATA.toDTariff} />

      {/* Recommendations Card */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Actionable Recommendations
        </h2>
        <div className="space-y-6">
          {MOCK_DATA.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-col md:flex-row items-center justify-between p-6 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="mb-4 md:mb-0 md:mr-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  {rec.title}
                </h3>
                <p className="text-gray-600 mt-1">{rec.description}</p>
              </div>
              <div className="flex-shrink-0 flex space-x-3">
                <button className="bg-white text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50">
                  Ignore
                </button>
                <button className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-blue-700">
                  {rec.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptimizationView;
