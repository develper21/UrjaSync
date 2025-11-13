'use client';

import React, { useState } from 'react';
import ApplianceCard from '@/components/appliances/ApplianceCard';
import { Appliance } from '@/lib/types';
import { MOCK_DATA } from '@/lib/mockData';

const AppliancesView: React.FC = () => {
  const [appliances, setAppliances] = useState<Appliance[]>(MOCK_DATA.appliances);

  const toggleApplianceStatus = (id: number) => {
    setAppliances((currentAppliances) =>
      currentAppliances.map((appliance) =>
        appliance.id === id
          ? {
              ...appliance,
              status: appliance.status === 'On' ? 'Off' : 'On',
            }
          : appliance
      )
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Appliances</h1>
      <p className="text-gray-600">
        Monitor and control all your connected devices from one place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appliances.map((appliance) => (
          <ApplianceCard
            key={appliance.id}
            appliance={appliance}
            onToggleStatus={() => toggleApplianceStatus(appliance.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AppliancesView;
