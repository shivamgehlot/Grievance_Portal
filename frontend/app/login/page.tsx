'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { DepartmentId, DEPARTMENT_MAP, UserRole } from '@/types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentId>('water');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password, selectedRole, selectedRole === 'admin' ? selectedDepartment : undefined);
      
      if (success) {
        // Wait a bit for user state to update
        setTimeout(() => {
          if (selectedRole === 'superadmin') {
            router.push('/super-admin/dashboard');
          } else if (selectedRole === 'admin') {
            router.push('/admin/analytics');
          } else {
            router.push('/user/dashboard');
          }
        }, 100);
      } else {
        setError('Invalid credentials or unauthorized access');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black">Public Grievance System</h1>
            <p className="text-gray-600 mt-2">Login to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Login As
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-gray-900"
                required
              >
                <option value="citizen">Citizen</option>
                <option value="admin">Department Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            {selectedRole === 'admin' && (
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Department
                </label>
                <select
                  id="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value as DepartmentId)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-gray-900"
                  required
                >
                  {Object.entries(DEPARTMENT_MAP).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-gray-900"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-gray-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-black font-medium hover:underline">
                Register as Citizen
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Demo Login Credentials:
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Email:</strong> test@example.com</p>
              <p><strong>Password:</strong> Test123!</p>
              <p className="text-gray-500 text-center mt-2">
                Select your role and department (if admin)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
