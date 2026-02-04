'use client';

import React, { useState, useEffect } from 'react';
import TariffCard from '@/components/optimization/TariffCard';
import { useAuth } from '@/lib/hooks/useAuth';

interface TariffPeriod {
  id: number;
  period: string;
  rate: number;
  type: 'Off-Peak' | 'Standard' | 'Peak';
  icon: React.ReactNode;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  cta: string;
}

const OptimizationView: React.FC = () => {
  const { accessToken } = useAuth();
  const [tariffs, setTariffs] = useState<TariffPeriod[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;
      
      try {
        // Fetch tariffs
        const tariffsResponse = await fetch('/api/tariffs', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (tariffsResponse.ok) {
          const tariffsData = await tariffsResponse.json();
          setTariffs(tariffsData.data.tariffs || []);
        } else {
          console.error('Failed to fetch tariffs');
          setTariffs([]);
        }

        // Fetch recommendations
        const recommendationsResponse = await fetch('/api/recommendations', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (recommendationsResponse.ok) {
          const recommendationsData = await recommendationsResponse.json();
          setRecommendations(recommendationsData.data.recommendations || []);
        } else {
          console.error('Failed to fetch recommendations');
          setRecommendations([]);
        }
      } catch (error) {
        console.error('Error fetching optimization data:', error);
        setTariffs([]);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Optimization Engine</h1>
          <p className="text-gray-600 mt-1">
            Save money by using energy at the right time.
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Optimization Engine</h1>
        <p className="text-gray-600 mt-1">
          Save money by using energy at the right time.
        </p>
      </div>

      {/* ToD Tariff Card */}
      <TariffCard tariffs={tariffs} />

      {/* Recommendations Card */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Actionable Recommendations
        </h2>
        <div className="space-y-6">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-col md:flex-row items-center justify-between p-6 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {rec.title}
                </h3>
                <p className="text-gray-600">{rec.description}</p>
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {rec.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptimizationView;
