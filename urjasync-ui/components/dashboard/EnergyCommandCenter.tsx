'use client';

import React from 'react';
import { BatteryMode, EvScheduleStatus } from '@/lib/types';

interface EnergyCommandCenterProps {
  data?: {
    overview: {
      production: number;
      consumption: number;
      storageLevel: number;
      gridImport: number;
      renewableShare: number;
    };
    assets: any[];
    controls: {
      batteryMode: BatteryMode;
      evSchedule: {
        nextCharge: string;
        status: EvScheduleStatus;
        recommendedWindow: string;
      };
    };
    lastUpdated: string;
  };
  loading?: boolean;
  mutating?: boolean;
  error?: string | null;
  onBatteryModeChange?: (mode: BatteryMode) => Promise<unknown> | void;
  onEvScheduleUpdate?: (update: any) => Promise<unknown> | void;
  onRefresh?: () => void;
}

const EnergyCommandCenter: React.FC<EnergyCommandCenterProps> = ({
  data,
  error,
  onBatteryModeChange,
  onEvScheduleUpdate,
  onRefresh,
}) => {
  const netFlow = data?.overview ? data.overview.production - data.overview.consumption : 0;
  const netFlowPositive = netFlow >= 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Energy Command Center</h2>
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-600">Generation</div>
          <div className="text-lg font-semibold text-green-600">
            {data?.overview ? `${data.overview.production.toFixed(1)} kW` : '0.0 kW'}
          </div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-sm text-gray-600">Consumption</div>
          <div className="text-lg font-semibold text-red-600">
            {data?.overview ? `${data.overview.consumption.toFixed(1)} kW` : '0.0 kW'}
          </div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600">Storage</div>
          <div className="text-lg font-semibold text-blue-600">
            {data?.overview ? `${data.overview.storageLevel.toFixed(0)}%` : '0%'}
          </div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-sm text-gray-600">Grid Import</div>
          <div className="text-lg font-semibold text-purple-600">
            {data?.overview ? `${data.overview.gridImport.toFixed(1)} kW` : '0.0 kW'}
          </div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-sm text-gray-600">Renewable</div>
          <div className="text-lg font-semibold text-yellow-600">
            {data?.overview ? `${data.overview.renewableShare.toFixed(0)}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Net Flow Indicator */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Net Energy Flow</span>
          <span className={`text-lg font-semibold ${netFlowPositive ? 'text-green-600' : 'text-red-600'}`}>
            {netFlowPositive ? '+' : ''}{netFlow.toFixed(2)} kW
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Battery Mode</h3>
          <select
            value={data?.controls?.batteryMode || 'Self-Power'}
            onChange={(e) => onBatteryModeChange?.(e.target.value as BatteryMode)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="Backup">Backup</option>
            <option value="Self-Power">Self-Power</option>
            <option value="Time-Based">Time-Based</option>
          </select>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">EV Schedule</h3>
          <div className="space-y-2">
            <input
              type="time"
              value={data?.controls?.evSchedule?.nextCharge || '22:30'}
              onChange={(e) => onEvScheduleUpdate?.({ nextCharge: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <select
              value={data?.controls?.evSchedule?.status || 'Scheduled'}
              onChange={(e) => onEvScheduleUpdate?.({ status: e.target.value as EvScheduleStatus })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Charging">Charging</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default EnergyCommandCenter;
