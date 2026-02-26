'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/analytics');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting to Analytics...</p>
    </div>
  );
}
