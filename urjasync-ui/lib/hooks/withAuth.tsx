'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Higher-order component for authentication protection
const withAuth = (WrappedComponent: React.ComponentType) => {
  return function AuthenticatedComponent(props: any) {
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

    // If authenticated, render the wrapped component
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (!accessToken || !user) {
      return null; // Will redirect in useEffect
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
