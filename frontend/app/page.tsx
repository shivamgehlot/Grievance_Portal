'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user) {
      switch (user.role) {
        case 'user':
          router.push('/user/dashboard');
          break;
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'super-admin':
          router.push('/super-admin/dashboard');
          break;
        default:
          router.push('/login');
      }
    }
  }, [isAuthenticated, user, router]);

  return null;
}
