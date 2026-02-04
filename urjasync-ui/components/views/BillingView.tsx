'use client';

import React, { useState, useEffect } from 'react';
import BillingHistoryTable from '@/components/billing/BillingHistoryTable';
import { useAuth } from '@/lib/hooks/useAuth';

import { Bill } from '@/lib/types';

const BillingView: React.FC = () => {
  const { accessToken } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [estimatedBill, setEstimatedBill] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const response = await fetch('/api/billing', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setBills(data.data.bills || []);
          setEstimatedBill(data.data.estimatedBill || 0);
          setTotalSavings(data.data.totalSavings || 0);
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchBillingData();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Billing & Savings</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

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
            ₹{estimatedBill.toFixed(2)}
          </p>
          <p className="text-gray-600 mt-2">
            Next bill generates on {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Total Savings This Month
          </h2>
          <p className="text-5xl font-bold">
            ₹{totalSavings.toFixed(2)}
          </p>
          <p className="opacity-90 mt-2">
            Thanks to your smart optimizations!
          </p>
        </div>
      </div>

      <BillingHistoryTable bills={bills} />
    </div>
  );
};

export default BillingView;
