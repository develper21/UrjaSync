'use client';

import React, { useState, useEffect } from 'react';
import ApplianceCard from '@/components/appliances/ApplianceCard';
import { useAuth } from '@/lib/hooks/useAuth';

interface DatabaseAppliance {
  id: string;
  name: string;
  type: string;
  status: string;
  consumption: string;
}

const AppliancesView: React.FC = () => {
  const { accessToken } = useAuth();
  const [appliances, setAppliances] = useState<DatabaseAppliance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppliances = async () => {
      try {
        const response = await fetch('/api/devices', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setAppliances(data.data.devices || []);
        }
      } catch (error) {
        console.error('Error fetching appliances:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchAppliances();
    }
  }, [accessToken]);

  const toggleApplianceStatus = async (id: string) => {
    try {
      const appliance = appliances.find(a => a.id === id);
      if (!appliance) return;

      const newStatus = appliance.status === 'On' ? 'Off' : 'On';
      
      const response = await fetch(`/api/devices/${id}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: newStatus.toLowerCase(),
        }),
      });

      if (response.ok) {
        setAppliances((currentAppliances) =>
          currentAppliances.map((app) =>
            app.id === id
              ? { ...app, status: newStatus }
              : app
          )
        );
      }
    } catch (error) {
      console.error('Error toggling appliance:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">My Appliances</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

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
            appliance={{
              id: parseInt(appliance.id),
              name: appliance.name,
              type: appliance.type as any,
              status: appliance.status as any,
              consumption: parseFloat(appliance.consumption),
              icon: null,
            }}
            onToggleStatus={() => toggleApplianceStatus(appliance.id)}
          />
        ))}
      </div>

      {appliances.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No appliances found</p>
          <p className="text-gray-400 mt-2">Add your first device to get started</p>
        </div>
      )}
    </div>
  );
};

export default AppliancesView;
