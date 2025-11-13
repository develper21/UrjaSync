import React from 'react';
import { Recommendation } from '@/lib/types';

interface RecommendationsProps {
  recommendations: Recommendation[];
}

const Recommendations: React.FC<RecommendationsProps> = ({ recommendations }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h2 className="text-xl font-semibold mb-4 text-gray-700">Smart Recommendations</h2>
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <div key={rec.id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h3 className="font-semibold text-gray-800">{rec.title}</h3>
          <p className="text-sm text-gray-600 my-2">{rec.description}</p>
          <button className="w-full text-sm font-medium text-blue-600 hover:text-blue-800">
            {rec.cta}
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default Recommendations;
