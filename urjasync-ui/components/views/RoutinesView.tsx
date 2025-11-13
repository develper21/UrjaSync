'use client';

import React from 'react';
import RoutineCard from '@/components/routines/RoutineCard';
import { MOCK_DATA } from '@/lib/mockData';

const RoutinesView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Automations & Routines
          </h1>
          <p className="text-gray-600 mt-1">
            Set it and forget it. Let your home work for you.
          </p>
        </div>
        <button className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-blue-700">
          Create Routine
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_DATA.routines.map((routine) => (
          <RoutineCard key={routine.id} routine={routine} />
        ))}
      </div>
    </div>
  );
};

export default RoutinesView;
