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
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      switch (user.role) {
        case 'citizen':
          router.push('/user/dashboard');
          break;
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'superadmin':
          router.push('/super-admin/dashboard');
          break;
        default:
          router.push('/login');
      }
    }
  }, [isAuthenticated, user, allowedRoles, router, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
