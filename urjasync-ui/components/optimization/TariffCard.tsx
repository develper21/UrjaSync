import React from 'react';
import { TariffPeriod } from '@/lib/types';
import MoonIcon from '@/components/icons/MoonIcon';
import SunIcon from '@/components/icons/SunIcon';
import ZapIcon from '@/components/icons/ZapIcon';

interface TariffCardProps {
  tariffs: TariffPeriod[];
}

const TariffCard: React.FC<TariffCardProps> = ({ tariffs }) => {
  const getTariffIcon = (tariff: TariffPeriod) => {
    if (tariff.icon) {
      return React.cloneElement(tariff.icon as React.ReactElement<any>, {
        className: 'w-6 h-6',
      });
    }
    
    // Fallback icons based on tariff type
    switch (tariff.type) {
      case 'Off-Peak':
        return <MoonIcon className="w-6 h-6 text-green-600" />;
      case 'Peak':
        return <ZapIcon className="w-6 h-6 text-red-600" />;
      default:
        return <SunIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-700 p-6">
        Time-of-Day (ToD) Tariffs
      </h2>
      <div className="divide-y divide-gray-200">
        {tariffs.map((tariff) => (
          <div
            key={tariff.id}
            className={`flex items-center justify-between p-6 ${
              tariff.type === 'Peak'
                ? 'bg-red-50'
                : tariff.type === 'Off-Peak'
                  ? 'bg-green-50'
                  : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              {getTariffIcon(tariff)}
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {tariff.period}
                </p>
                <p
                  className={`font-medium ${
                    tariff.type === 'Peak'
                      ? 'text-red-600'
                      : tariff.type === 'Off-Peak'
                        ? 'text-green-700'
                        : 'text-gray-600'
                  }`}
                >
                  {tariff.type}
                </p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              ₹{tariff.rate.toFixed(2)}{' '}
              <span className="text-sm font-normal text-gray-500">/ kWh</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TariffCard;
