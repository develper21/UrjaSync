'use client';

import React, { useState, useEffect } from 'react';
import RoutineCard from '@/components/routines/RoutineCard';
import RoutineCreator from '@/components/routines/RoutineCreator';
import { useAuth } from '@/lib/hooks/useAuth';

interface Routine {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  isActive?: boolean;
  lastRun?: string;
}

const RoutinesView: React.FC = () => {
  const { accessToken } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await fetch('/api/routines', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setRoutines(data.data.routines || []);
        }
      } catch (error) {
        console.error('Error fetching routines:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchRoutines();
    }
  }, [accessToken]);

  const handleCreateRoutine = async (newRoutine: { name: string; trigger: string; actions: string[] }) => {
    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newRoutine),
      });

      if (response.ok) {
        const data = await response.json();
        setRoutines(prev => [...prev, data.data.routine]);
      } else {
        throw new Error('Failed to create routine');
      }
    } catch (error) {
      console.error('Error creating routine:', error);
      throw error;
    }
  };

  const handleToggleRoutine = async (id: string, isActive: boolean) => {
    // This would be implemented with a PUT/PATCH endpoint
    setRoutines(prev => 
      prev.map(routine => 
        routine.id === id ? { ...routine, isActive } : routine
      )
    );
  };

  const handleDeleteRoutine = async (id: string) => {
    // This would be implemented with a DELETE endpoint
    setRoutines(prev => prev.filter(routine => routine.id !== id));
  };

  if (loading) {
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

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
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Create Routine
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routines.map((routine) => (
          <RoutineCard 
            key={routine.id} 
            routine={routine}
            onToggle={() => handleToggleRoutine(routine.id, !routine.isActive)}
            onDelete={() => handleDeleteRoutine(routine.id)}
          />
        ))}
      </div>

      {routines.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-gray-500 text-lg mb-2">No routines found</p>
          <p className="text-gray-400 mb-6">Create your first routine to get started</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Create Your First Routine
          </button>
        </div>
      )}

      <RoutineCreator
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRoutine}
      />
    </div>
  );
};

export default RoutinesView;
