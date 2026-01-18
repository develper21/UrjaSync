'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Hook to check authentication status
export const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (!accessToken || !user) {
      router.push('/auth/login');
      return;
    }
  }, [router]);

  // Get user data
  const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirect to login
    router.push('/auth/login');
  };

  const isAuthenticated = !!accessToken && !!userData.id;

  return {
    user: userData,
    accessToken,
    refreshToken,
    isAuthenticated,
    logout,
  };
};
