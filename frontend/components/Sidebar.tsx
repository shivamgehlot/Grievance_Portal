'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/types';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  AlertCircle,
  Search
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const userLinks = [
    { href: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/user/grievances', label: 'My Grievances', icon: FileText },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/grievances', label: 'Manage Grievances', icon: FileText },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const superAdminLinks = [
    { href: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/super-admin/departments', label: 'Departments', icon: BarChart3 },
    { href: '/super-admin/admins', label: 'Manage Admins', icon: Users },
    { href: '/super-admin/analytics', label: 'Global Analytics', icon: BarChart3 },
  ];

  const links = role === 'user' ? userLinks : role === 'admin' ? adminLinks : superAdminLinks;

  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-black">Grievance Portal</h1>
        <p className="text-sm text-gray-600 mt-1">
          {role === 'user' && 'Citizen Portal'}
          {role === 'admin' && 'Admin Panel'}
          {role === 'super-admin' && 'Super Admin'}
        </p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
