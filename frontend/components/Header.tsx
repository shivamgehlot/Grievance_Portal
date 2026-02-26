'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleName = () => {
    if (user?.role === 'user') return 'User';
    if (user?.role === 'admin') return `Admin - ${user.department}`;
    if (user?.role === 'super-admin') return 'Super Administrator';
    return '';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-black">
          {user?.name}
        </h2>
        <span className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700">
          {getRoleName()}
        </span>
      </div>
      
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </header>
  );
}
