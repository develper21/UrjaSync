'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
          <span className="text-white text-2xl font-bold">⚡</span>
        </div>
        <div className="h-8 w-8 border-b-2 border-blue-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading UrjaSync...</p>
      </div>
    </div>
  );
}
