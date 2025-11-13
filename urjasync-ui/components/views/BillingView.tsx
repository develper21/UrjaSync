'use client';

import React from 'react';
import BillingHistoryTable from '@/components/billing/BillingHistoryTable';
import { MOCK_DATA } from '@/lib/mockData';

const BillingView: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Billing & Savings</h1>
      <p className="text-gray-600">
        Track your estimated costs and optimization savings.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Estimated Monthly Bill
          </h2>
          <p className="text-5xl font-bold text-gray-900">
            ₹{MOCK_DATA.estimatedBill.toFixed(2)}
          </p>
          <p className="text-gray-600 mt-2">
            Next bill generates on Nov 1, 2025
          </p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Total Savings This Month
          </h2>
          <p className="text-5xl font-bold">
            ₹{MOCK_DATA.totalSavings.toFixed(2)}
          </p>
          <p className="opacity-90 mt-2">
            Thanks to your smart optimizations!
          </p>
        </div>
      </div>

      <BillingHistoryTable bills={MOCK_DATA.bills} />
    </div>
  );
};

export default BillingView;
