'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UseAuthRedirectOptions {
  redirectTo: string;
  condition: 'authenticated' | 'unauthenticated';
}

export function useAuthRedirect({ redirectTo, condition }: UseAuthRedirectOptions) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (condition === 'authenticated' && !user) {
      router.push(redirectTo);
    } else if (condition === 'unauthenticated' && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo, condition]);

  return { user, loading };
}
