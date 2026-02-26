'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import { useState } from 'react';
import { DepartmentId, DEPARTMENT_MAP } from '@/types';
import { Plus, X, CheckCircle } from 'lucide-react';

interface AdminFormData {
  email: string;
  password: string;
  confirmPassword: string;
  departments: DepartmentId[];
}

export default function ManageAdminsPage() {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<AdminFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    departments: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDepartmentToggle = (deptId: DepartmentId) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(deptId)
        ? prev.departments.filter(d => d !== deptId)
        : [...prev.departments, deptId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.departments.length === 0) {
      setError('Please select at least one department');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register({
        email: formData.email,
        password: formData.password,
        role: 'admin',
        departments: formData.departments,
      });

      setSuccess(`Admin created successfully for: ${formData.departments.map(d => DEPARTMENT_MAP[d]).join(', ')}`);
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        departments: [],
      });
      
      setTimeout(() => {
        setShowCreateForm(false);
        setSuccess('');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const departmentsList = Object.entries(DEPARTMENT_MAP) as [DepartmentId, string][];

  return (
    <ProtectedRoute allowedRoles={['superadmin']}>
      <DashboardLayout role="superadmin">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">Admin Management</h1>
              <p className="text-gray-600 mt-1">Create and manage department administrators</p>
            </div>
            
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus size={20} />
                Create New Admin
              </button>
            )}
          </div>

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800 flex items-center gap-2">
              <CheckCircle size={20} />
              {success}
            </div>
          )}

          {showCreateForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black">Create Department Admin</h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setError('');
                    setFormData({
                      email: '',
                      password: '',
                      confirmPassword: '',
                      departments: [],
                    });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-gray-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-gray-900"
                      required
                      minLength={6}
                    />
                    <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Assign Departments * (Select at least one)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {departmentsList.map(([deptId, deptName]) => (
                      <label
                        key={deptId}
                        className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                          formData.departments.includes(deptId)
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-900 border-gray-300 hover:border-black'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.departments.includes(deptId)}
                          onChange={() => handleDepartmentToggle(deptId)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">{deptName}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Selected: {formData.departments.length} department(s)
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                  >
                    {loading ? 'Creating Admin...' : 'Create Admin'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setError('');
                      setFormData({
                        email: '',
                        password: '',
                        confirmPassword: '',
                        departments: [],
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4">Department Overview</h2>
            <p className="text-gray-600 mb-6">
              Create admins for specific departments. Each admin will only have access to grievances from their assigned departments.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentsList.map(([deptId, deptName]) => (
                <div
                  key={deptId}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{deptName}</h3>
                  <p className="text-sm text-gray-600">Department ID: {deptId}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
