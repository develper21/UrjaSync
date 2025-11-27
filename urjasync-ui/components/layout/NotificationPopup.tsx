'use client';

import React, { useEffect, useState } from 'react';
import XIcon from '@/components/icons/XIcon';

const NotificationPopup: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!showNotification) return null;

  return (
    <>
      <style>{`
        @keyframes spin-border {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-spin-border {
          animation: spin-border 2.5s linear infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>

      <div className="fixed bottom-10 right-10 z-50 animate-fade-in-up">
        {/* Animated Border */}
        <div
          className="absolute inset-0 rounded-full animate-spin-border"
          style={{
            background:
              'conic-gradient(from 0deg, #3b82f6, #bfdbfe, transparent, #3b82f6)',
          }}
        ></div>

        {/* Content */}
        <div className="relative w-80 bg-white rounded-xl shadow-2xl overflow-hidden p-1.5">
          <div className="bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="flex items-center">
                <span className="relative flex h-3 w-3 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <span className="font-semibold text-blue-700">System Live</span>
              </span>
              <button
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Welcome to UrjaSync!</h3>
            <p className="text-sm text-gray-600">
              Your smart meter and appliances are connected. You&apos;re all set to optimize!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationPopup;
