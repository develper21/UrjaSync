'use client';

import React, { useState, useEffect } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import UsageChart from '@/components/dashboard/UsageChart';
import EnergyCommandCenter from '@/components/dashboard/EnergyCommandCenter';
import Recommendations from '@/components/dashboard/Recommendations';
import ZapIcon from '@/components/icons/ZapIcon';
import CurrencyRupeeIcon from '@/components/icons/CurrencyRupeeIcon';
import LeafIcon from '@/components/icons/LeafIcon';
import SunIcon from '@/components/icons/SunIcon';
import MoonIcon from '@/components/icons/MoonIcon';
import { useAuth } from '@/lib/hooks/useAuth';

interface DashboardViewProps {
  onNavigate?: (page: string) => void;
}

interface ChartData {
  name: string;
  usage: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  cta: string;
}

interface Routine {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { accessToken, user } = useAuth();
  const [liveUsage, setLiveUsage] = useState(0);
  const [estimatedBill, setEstimatedBill] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [usageHistory, setUsageHistory] = useState<ChartData[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const getPeakStatus = () => {
    const hour = new Date().getHours();
    return hour >= 18 && hour < 22 ? 'Peak Time' : 'Off-Peak';
  };

  const isPeak = getPeakStatus() === 'Peak Time';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch live energy data
        const liveResponse = await fetch('/api/energy/live', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (liveResponse.ok) {
          const liveData = await liveResponse.json();
          setLiveUsage(parseFloat(liveData.data.summary.currentConsumption || '0'));
        }

        // Fetch billing data
        const billingResponse = await fetch('/api/billing', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (billingResponse.ok) {
          const billingData = await billingResponse.json();
          setEstimatedBill(billingData.data.estimatedBill || 0);
          setTotalSavings(billingData.data.totalSavings || 0);
        }

        // Fetch energy usage for chart
        try {
          const usageResponse = await fetch('/api/energy/usage?limit=24', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          
          if (usageResponse.ok) {
            const usageData = await usageResponse.json();
            console.log('Usage data from API:', usageData);
            
            // Transform API data to chart format
            if (usageData.data && usageData.data.usage && usageData.data.usage.length > 0) {
              const chartData = usageData.data.usage.map((record: any) => {
                const hour = new Date(record.timestamp).getHours();
                return {
                  name: `${hour.toString().padStart(2, '0')}:00`,
                  usage: parseFloat(record.usage || '0')
                };
              }).slice(0, 12); // Take last 12 records
              
              setUsageHistory(chartData);
            } else {
              // No data available, show empty chart
              setUsageHistory([]);
            }
          } else {
            console.log('API failed, showing empty chart');
            setUsageHistory([]);
          }
        } catch (error) {
          console.log('Error fetching usage, showing empty chart:', error);
          setUsageHistory([]);
        }

        // Fetch recommendations from API
        try {
          const recommendationsResponse = await fetch('/api/recommendations', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          
          if (recommendationsResponse.ok) {
            const recommendationsData = await recommendationsResponse.json();
            setRecommendations(recommendationsData.data.recommendations || []);
          } else {
            console.log('Recommendations API failed');
            setRecommendations([]);
          }
        } catch (error) {
          console.log('Error fetching recommendations:', error);
          setRecommendations([]);
        }

        // Fetch routines from API
        try {
          const routinesResponse = await fetch('/api/routines', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          
          if (routinesResponse.ok) {
            const routinesData = await routinesResponse.json();
            const formattedRoutines = routinesData.data.routines.map((routine: any) => ({
              id: routine.id,
              name: routine.name,
              trigger: typeof routine.trigger === 'string' ? routine.trigger : JSON.stringify(routine.trigger),
              actions: Array.isArray(routine.actions) ? routine.actions.map((action: any) => typeof action === 'string' ? action : JSON.stringify(action)) : []
            }));
            setRoutines(formattedRoutines);
          } else {
            console.log('Routines API failed');
            setRoutines([]);
          }
        } catch (error) {
          console.log('Error fetching routines:', error);
          setRoutines([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchDashboardData();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Hello, {user?.firstName || 'User'}!</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Hello, {user?.firstName || 'User'}!</h1>
      <p className="text-gray-600">Here&apos;s your unified home energy dashboard.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Live Usage"
          value={`${liveUsage.toFixed(2)} kW`}
          icon={<ZapIcon className="text-blue-500" />}
        />
        <StatCard
          title="Current Tariff"
          value={getPeakStatus()}
          icon={
            isPeak ? (
              <SunIcon className="text-red-500" />
            ) : (
              <MoonIcon className="text-gray-700" />
            )
          }
        />
        <StatCard
          title="Estimated Bill"
          value={`₹${estimatedBill.toFixed(2)}`}
          icon={<CurrencyRupeeIcon className="text-green-500" />}
        />
        <StatCard
          title="Total Savings"
          value={`₹${totalSavings.toFixed(2)}`}
          icon={<LeafIcon className="text-green-600" />}
        />
      </div>

      {/* Charts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UsageChart data={usageHistory} />
        <Recommendations recommendations={recommendations} />
      </div>

      {/* Energy Command Center */}
      <EnergyCommandCenter
        data={{
          overview: {
            production: liveUsage * 0.3,
            consumption: liveUsage,
            storageLevel: 50,
            gridImport: liveUsage * 0.1,
            renewableShare: 25,
          },
          assets: [],
          controls: {
            batteryMode: 'Self-Power',
            evSchedule: {
              nextCharge: '22:30',
              status: 'Scheduled',
              recommendedWindow: '10 PM - 6 AM',
            },
          },
          lastUpdated: new Date().toISOString(),
        }}
        loading={false}
        mutating={false}
        error={null}
        onBatteryModeChange={() => {}}
        onEvScheduleUpdate={() => {}}
        onRefresh={() => {}}
      />

      {/* Routines */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Active Routines</h2>
        <div className="space-y-3">
          {routines.slice(0, 2).map((routine) => (
            <div key={routine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">{routine.name}</h3>
                <p className="text-sm text-gray-600">{routine.trigger}</p>
              </div>
              <button
                onClick={() => onNavigate?.('routines')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
