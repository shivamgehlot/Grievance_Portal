'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types';

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
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
  }, [isAuthenticated, user, allowedRoles, router]);

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
