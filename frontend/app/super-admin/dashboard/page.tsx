'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { mockAdmins, departments, mockGrievances } from '@/mock-data';
import { useState } from 'react';
import { format } from '@/lib/date-fns';
import { Plus, XCircle } from 'lucide-react';
import { Department } from '@/types';

export default function SuperAdminDashboard() {
  const [admins, setAdmins] = useState(mockAdmins);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState<{ name: string; email: string; department: Department | ''; isActive: boolean }>({ name: '', email: '', department: '', isActive: true });

  const allGrievances = mockGrievances;
  const total = allGrievances.length;
  const solved = allGrievances.filter((g) => g.status === 'Solved').length;
  const pending = allGrievances.filter((g) => g.status !== 'Solved').length;
  const highUrgency = allGrievances.filter((g) => g.urgency === 'High').length;

  const departmentStats = departments.map((dept) => {
    const deptGrievances = allGrievances.filter((g) => g.department === dept);
    const solved = deptGrievances.filter((g) => g.status === 'Solved').length;
    const pending = deptGrievances.filter((g) => g.status !== 'Solved').length;
    return {
      department: dept,
      total: deptGrievances.length,
      solved,
      pending,
      avgResolutionTime: '3.2 days',
    };
  });

  return (
    <ProtectedRoute allowedRoles={['super-admin']}>
      <DashboardLayout role="super-admin">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-black">Super Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">System-wide analytics and admin management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600">Total Complaints</p>
              <p className="text-3xl font-bold text-black mt-2">{total}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600">Total Solved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{solved}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600">Total Pending</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{pending}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600">Total High Urgency</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{highUrgency}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-6">Department Analytics</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Complaints</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Solved</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pending</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Resolution Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">View</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentStats.map((stat) => (
                    <tr key={stat.department} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{stat.department}</td>
                      <td className="py-3 px-4 text-gray-900">{stat.total}</td>
                      <td className="py-3 px-4 text-green-700">{stat.solved}</td>
                      <td className="py-3 px-4 text-gray-700">{stat.pending}</td>
                      <td className="py-3 px-4 text-gray-700">{stat.avgResolutionTime}</td>
                      <td className="py-3 px-4">
                        <button className="text-black hover:underline font-medium">View Department</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-6">Admin Management</h2>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowCreateAdmin(true)}
                className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus size={18} className="mr-2" />
                Create Admin
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{admin.name}</td>
                      <td className="py-3 px-4 text-gray-700">{admin.email}</td>
                      <td className="py-3 px-4 text-gray-700">{admin.department}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs border rounded ${admin.isActive ? 'bg-green-50 text-green-800 border-green-200' : 'bg-gray-50 text-gray-800 border-gray-200'}`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{format(new Date(admin.createdAt), 'MMM dd, yyyy')}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setAdmins((prev) => prev.map((a) => a.id === admin.id ? { ...a, isActive: !a.isActive } : a))}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
                        >
                          {admin.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showCreateAdmin && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-black">Create Admin</h3>
                    <button onClick={() => setShowCreateAdmin(false)} className="p-1 hover:bg-gray-100 rounded">
                      <XCircle size={20} />
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newAdmin.department) return;
                      setAdmins((prev) => [
                        ...prev,
                        {
                          id: `admin-${Date.now()}`,
                          email: newAdmin.email,
                          name: newAdmin.name,
                          department: newAdmin.department as Department,
                          isActive: true,
                          createdAt: new Date().toISOString(),
                        },
                      ]);
                      setShowCreateAdmin(false);
                      setNewAdmin({ name: '', email: '', department: '', isActive: true });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        id="department"
                        value={newAdmin.department}
                        onChange={(e) => setNewAdmin((prev) => ({ ...prev, department: e.target.value as Department | '' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowCreateAdmin(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
