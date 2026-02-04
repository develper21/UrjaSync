'use client';

import React, { useState } from 'react';
import ScheduleMaintenanceModal from '@/components/maintenance/ScheduleMaintenanceModal';
import ServiceProvidersModal from '@/components/maintenance/ServiceProvidersModal';

// Custom SVG Icons for Maintenance
const WrenchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const WarningIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const MaintenanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isProvidersModalOpen, setIsProvidersModalOpen] = useState(false);

  // Mock data for devices
  const devices = [
    {
      id: 1,
      name: 'Samsung AC',
      type: 'Air Conditioner',
      location: 'Living Room',
      healthScore: 85,
      status: 'healthy',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-04-10',
      warrantyExpiry: '2025-12-31',
      efficiency: 92,
      issues: [],
      predictedFailure: 0.05,
    },
    {
      id: 2,
      name: 'LG Refrigerator',
      type: 'Refrigerator',
      location: 'Kitchen',
      healthScore: 72,
      status: 'warning',
      lastMaintenance: '2023-12-15',
      nextMaintenance: '2024-02-15',
      warrantyExpiry: '2024-06-30',
      efficiency: 78,
      issues: ['Compressor noise detected', 'Higher power consumption'],
      predictedFailure: 0.25,
    },
    {
      id: 3,
      name: 'Whirlpool Washing Machine',
      type: 'Washing Machine',
      location: 'Bathroom',
      healthScore: 45,
      status: 'critical',
      lastMaintenance: '2023-10-20',
      nextMaintenance: '2024-01-20',
      warrantyExpiry: '2024-03-31',
      efficiency: 65,
      issues: ['Motor vibration', 'Water leakage detected'],
      predictedFailure: 0.65,
    },
    {
      id: 4,
      name: 'Philips TV',
      type: 'Television',
      location: 'Bedroom',
      healthScore: 95,
      status: 'healthy',
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-07-05',
      warrantyExpiry: '2026-01-31',
      efficiency: 98,
      issues: [],
      predictedFailure: 0.02,
    },
  ];

  const maintenanceSchedule = [
    { id: 1, device: 'LG Refrigerator', type: 'Scheduled', date: '2024-02-15', priority: 'medium', cost: 1200, status: 'scheduled' },
    { id: 2, device: 'Whirlpool Washing Machine', type: 'Emergency', date: '2024-01-25', priority: 'high', cost: 2500, status: 'pending' },
    { id: 3, device: 'Samsung AC', type: 'Routine Check', date: '2024-04-10', priority: 'low', cost: 800, status: 'scheduled' },
  ];

  const serviceProviders = [
    { id: 1, name: 'HomeCare Services', rating: 4.8, specialties: ['AC', 'Refrigerator'], responseTime: '2 hours', avgCost: '₹1,200' },
    { id: 2, name: 'QuickFix Technicians', rating: 4.6, specialties: ['Washing Machine', 'TV'], responseTime: '4 hours', avgCost: '₹1,000' },
    { id: 3, name: 'Expert Repairs', rating: 4.9, specialties: ['All Appliances'], responseTime: '1 hour', avgCost: '₹1,500' },
  ];

  const partsInventory = [
    { part: 'AC Filter', quantity: 2, device: 'Samsung AC', reorderLevel: 1, lastReplaced: '2024-01-10' },
    { part: 'Compressor', quantity: 0, device: 'LG Refrigerator', reorderLevel: 1, lastReplaced: '-' },
    { part: 'Motor Belt', quantity: 1, device: 'Whirlpool Washing Machine', reorderLevel: 1, lastReplaced: '2023-10-20' },
  ];

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Hub</h1>
          <p className="text-gray-600 mt-1">Predictive maintenance and device health monitoring</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Schedule Maintenance
          </button>
          <button 
            onClick={() => setIsProvidersModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Service Providers
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
            </div>
            <div className="text-3xl text-blue-600">
              <WrenchIcon className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Need Attention</p>
              <p className="text-2xl font-bold text-yellow-600">
                {devices.filter(d => d.status === 'warning' || d.status === 'critical').length}
              </p>
            </div>
            <div className="text-3xl text-yellow-600">
              <WarningIcon className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">
                {maintenanceSchedule.filter(m => m.status === 'scheduled').length}
              </p>
            </div>
            <div className="text-3xl text-blue-600">
              <CalendarIcon className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Health Score</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(devices.reduce((acc, d) => acc + d.healthScore, 0) / devices.length)}%
              </p>
            </div>
            <div className="text-3xl text-green-600">
              <HeartIcon className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Device Overview
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Maintenance Schedule
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'providers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Service Providers
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Parts Inventory
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Device Health Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.map((device) => (
                  <div key={device.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{device.name}</h4>
                        <p className="text-sm text-gray-600">{device.type} • {device.location}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(device.status)}`}>
                        {device.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Health Score */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Health Score</span>
                          <span className={`text-sm font-bold px-2 py-1 rounded ${getHealthColor(device.healthScore)}`}>
                            {device.healthScore}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              device.healthScore >= 80 ? 'bg-green-600' :
                              device.healthScore >= 60 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${device.healthScore}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Efficiency:</span>
                          <span className="ml-2 font-medium">{device.efficiency}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Failure Risk:</span>
                          <span className={`ml-2 font-medium ${
                            device.predictedFailure > 0.5 ? 'text-red-600' :
                            device.predictedFailure > 0.2 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {(device.predictedFailure * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Service:</span>
                          <span className="ml-2 font-medium">{device.lastMaintenance}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Warranty:</span>
                          <span className="ml-2 font-medium">{device.warrantyExpiry}</span>
                        </div>
                      </div>

                      {/* Issues */}
                      {device.issues.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-600 mb-1">Issues Detected:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {device.issues.map((issue, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="text-red-500">•</span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                          Schedule Service
                        </button>
                        <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Maintenance Schedule</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {maintenanceSchedule.map((maintenance) => (
                      <tr key={maintenance.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{maintenance.device}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            maintenance.type === 'Emergency' ? 'bg-red-100 text-red-800' :
                            maintenance.type === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {maintenance.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{maintenance.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            maintenance.priority === 'high' ? 'bg-red-100 text-red-800' :
                            maintenance.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {maintenance.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{maintenance.cost}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            maintenance.status === 'completed' ? 'bg-green-100 text-green-800' :
                            maintenance.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {maintenance.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'providers' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Service Providers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {serviceProviders.map((provider) => (
                  <div key={provider.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">{provider.name}</h4>
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{provider.rating}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Specialties:</span>
                        <span className="ml-2">{provider.specialties.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Response Time:</span>
                        <span className="ml-2">{provider.responseTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Average Cost:</span>
                        <span className="ml-2 font-medium">{provider.avgCost}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                        Book Service
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Parts Inventory</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Replaced</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {partsInventory.map((part, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{part.part}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.device}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            part.quantity === 0 ? 'bg-red-100 text-red-800' :
                            part.quantity <= part.reorderLevel ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {part.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.reorderLevel}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.lastReplaced}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            part.quantity === 0 ? 'bg-red-100 text-red-800' :
                            part.quantity <= part.reorderLevel ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {part.quantity === 0 ? 'Out of Stock' :
                             part.quantity <= part.reorderLevel ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Order</button>
                          <button className="text-gray-600 hover:text-gray-900">History</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ScheduleMaintenanceModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />

      <ServiceProvidersModal
        isOpen={isProvidersModalOpen}
        onClose={() => setIsProvidersModalOpen(false)}
      />
    </div>
  );
};

export default MaintenanceView;
