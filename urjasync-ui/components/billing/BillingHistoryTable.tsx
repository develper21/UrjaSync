import React from 'react';
import { Bill } from '@/lib/types';

interface BillingHistoryTableProps {
  bills: Bill[];
}

const BillingHistoryTable: React.FC<BillingHistoryTableProps> = ({ bills }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <h2 className="text-xl font-semibold text-gray-700 p-6">Billing History</h2>
    <table className="w-full min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">
            Invoice ID
          </th>
          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">
            Billing Period
          </th>
          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">
            Date
          </th>
          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">
            Amount
          </th>
          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">
            Status
          </th>
          <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6"></th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {bills.map((bill) => (
          <tr key={bill.id} className="hover:bg-gray-50">
            <td className="py-4 px-6 text-sm font-medium text-gray-800">
              {bill.id}
            </td>
            <td className="py-4 px-6 text-sm text-gray-600">{bill.period}</td>
            <td className="py-4 px-6 text-sm text-gray-600">{bill.date}</td>
            <td className="py-4 px-6 text-sm text-gray-800">
              ₹{bill.amount.toFixed(2)}
            </td>
            <td className="py-4 px-6 text-sm">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {bill.status}
              </span>
            </td>
            <td className="py-4 px-6 text-right text-sm font-medium">
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Download
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default BillingHistoryTable;
