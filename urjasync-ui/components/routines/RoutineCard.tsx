import React, { useState } from 'react';
import { Routine } from '@/lib/types';

interface RoutineCardProps {
  routine: Routine;
  onToggle?: () => void;
  onDelete?: () => void;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onToggle, onDelete }) => {
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    // Simulate running the routine
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRunning(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 relative">
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <div className={`w-3 h-3 rounded-full ${routine.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-2 pr-8">{routine.name}</h2>
      <p className="text-sm text-gray-500 mb-4">
        Trigger: <span className="font-medium text-gray-700">{routine.trigger}</span>
      </p>
      
      <div className="space-y-2 mb-6">
        <p className="text-sm font-medium text-gray-700">Actions:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          {routine.actions.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
      </div>

      <div className="flex space-x-2">
        <button 
          onClick={handleRun}
          disabled={isRunning || !routine.isActive}
          className="flex-1 bg-blue-50 text-blue-700 font-medium py-2 px-4 rounded-lg hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
        
        <button 
          onClick={onToggle}
          className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors ${
            routine.isActive 
              ? 'bg-green-50 text-green-700 hover:bg-green-100' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {routine.isActive ? 'Disable' : 'Enable'}
        </button>
        
        <button 
          onClick={onDelete}
          className="bg-red-50 text-red-700 font-medium py-2 px-4 rounded-lg hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default RoutineCard;
