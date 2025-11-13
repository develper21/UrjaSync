import React from 'react';
import { Routine } from '@/lib/types';

interface RoutineCardProps {
  routine: Routine;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ routine }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-2">{routine.name}</h2>
    <p className="text-sm text-gray-500 mb-4">
      Trigger: <span className="font-medium text-gray-700">{routine.trigger}</span>
    </p>
    <div className="space-y-2 mb-6">
      <p className="text-sm font-medium text-gray-700">Actions:</p>
      <ul className="list-disc list-inside space-y-1 text-gray-600">
        {routine.actions.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ul>
    </div>
    <div className="flex space-x-3">
      <button className="w-full bg-blue-50 text-blue-700 font-medium py-2 px-4 rounded-lg hover:bg-blue-100">
        Run
      </button>
      <button className="w-full bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-200">
        Edit
      </button>
    </div>
  </div>
);

export default RoutineCard;
