import React from 'react';
import { Appliance } from '@/lib/types';
import ToggleSwitch from './ToggleSwitch';
import AirVentIcon from '@/components/icons/AirVentIcon';
import WasherIcon from '@/components/icons/WasherIcon';
import LightbulbIcon from '@/components/icons/LightbulbIcon';
import BatteryIcon from '@/components/icons/BatteryIcon';

interface ApplianceCardProps {
  appliance: Appliance;
  onToggleStatus: () => void;
}

const ApplianceCard: React.FC<ApplianceCardProps> = ({ appliance, onToggleStatus }) => {
  const getApplianceIcon = (appliance: Appliance) => {
    if (appliance.icon) {
      return React.cloneElement(appliance.icon as React.ReactElement<any>, {
        className: `w-10 h-10 ${appliance.status === 'On' ? '' : 'text-gray-400'}`,
      });
    }
    
    // Fallback icons based on appliance type
    switch (appliance.type) {
      case 'AC':
        return <AirVentIcon className={`w-10 h-10 ${appliance.status === 'On' ? 'text-blue-600' : 'text-gray-400'}`} />;
      case 'Washer':
        return <WasherIcon className={`w-10 h-10 ${appliance.status === 'On' ? 'text-blue-600' : 'text-gray-400'}`} />;
      case 'Light':
        return <LightbulbIcon className={`w-10 h-10 ${appliance.status === 'On' ? 'text-yellow-500' : 'text-gray-400'}`} />;
      case 'Geyser':
        return <BatteryIcon className={`w-10 h-10 ${appliance.status === 'On' ? 'text-red-600' : 'text-gray-400'}`} />;
      default:
        return <LightbulbIcon className={`w-10 h-10 ${appliance.status === 'On' ? 'text-blue-600' : 'text-gray-400'}`} />;
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transition-all ${
        appliance.status === 'On' ? 'shadow-blue-100' : 'opacity-70'
      }`}
    >
      <div>
        <div className="flex justify-between items-start">
          {getApplianceIcon(appliance)}
          <ToggleSwitch
            enabled={appliance.status === 'On'}
            setEnabled={onToggleStatus}
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mt-4">{appliance.name}</h2>
        <span
          className={`text-sm font-medium ${
            appliance.status === 'On'
              ? 'text-blue-600'
              : 'text-gray-500'
          }`}
        >
          {appliance.status === 'Scheduled'
            ? 'Scheduled'
            : appliance.status === 'On'
              ? `${appliance.consumption} kW`
              : 'Off'}
        </span>
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <button className="text-sm text-gray-600 hover:text-gray-900">
          Schedule
        </button>
        <button className="text-sm text-gray-600 hover:text-gray-900">
          Details
        </button>
      </div>
    </div>
  );
};

export default ApplianceCard;
