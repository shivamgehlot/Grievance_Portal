'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Grievance, DEPARTMENT_MAP, STATUS_DISPLAY, PRIORITY_DISPLAY, DepartmentId } from '@/types';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadGrievances();
  }, [statusFilter, departmentFilter]);

  const loadGrievances = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getGrievances(
        departmentFilter || undefined,
        statusFilter || undefined,
        0,
        100
      );
      setGrievances(data);
    } catch (err) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'in_progress' | 'resolved' | 'rejected') => {
    try {
      setUpdatingId(id);
      await adminAPI.updateStatus(id, { status: newStatus });
      // Reload grievances to get updated data
      await loadGrievances();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = {
    total: grievances.length,
    submitted: grievances.filter((g) => g.status === 'submitted').length,
    inProgress: grievances.filter((g) => g.status === 'in_progress').length,
    resolved: grievances.filter((g) => g.status === 'resolved').length,
    rejected: grievances.filter((g) => g.status === 'rejected').length,
  };

  const priorityCount = {
    high: grievances.filter((g) => g.priority === 'high').length,
    medium: grievances.filter((g) => g.priority === 'medium').length,
    low: grievances.filter((g) => g.priority === 'low').length,
  };

  const userDepartments = user?.role === 'superadmin' 
    ? Object.keys(DEPARTMENT_MAP) as DepartmentId[]
    : (user?.departments || []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'submitted':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-50 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
      <DashboardLayout role={user?.role || 'admin'}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {user?.role === 'superadmin' ? 'All Departments' : 'Department Management'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Grievances</p>
                  <p className="text-3xl font-bold text-black mt-2">{stats.total}</p>
                </div>
                <AlertCircle size={32} className="text-gray-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
                </div>
                <CheckCircle size={32} className="text-green-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
                </div>
                <Clock size={32} className="text-blue-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New Submissions</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.submitted}</p>
                </div>
                <AlertCircle size={32} className="text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4">Priority Distribution</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{priorityCount.high}</p>
                <p className="text-sm text-gray-600">High Priority</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{priorityCount.medium}</p>
                <p className="text-sm text-gray-600">Medium Priority</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{priorityCount.low}</p>
                <p className="text-sm text-gray-600">Low Priority</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-gray-900"
                >
                  <option value="">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {user?.role === 'superadmin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Department
                  </label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-gray-900"
                  >
                    <option value="">All Departments</option>
                    {Object.entries(DEPARTMENT_MAP).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Grievances Table */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-6">Manage Grievances</h2>
            
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : grievances.length === 0 ? (
              <p className="text-gray-600">No grievances found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Message</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Confidence</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grievances.map((grievance) => (
                      <tr key={grievance.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 max-w-xs">
                          <div className="truncate" title={grievance.message}>
                            {grievance.message}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {DEPARTMENT_MAP[grievance.predicted_department]}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs border rounded ${getPriorityColor(grievance.priority)}`}>
                            {PRIORITY_DISPLAY[grievance.priority]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs border rounded ${getStatusColor(grievance.status)}`}>
                            {STATUS_DISPLAY[grievance.status]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {(grievance.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4 text-gray-700">{formatDate(grievance.created_at)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {grievance.status !== 'in_progress' && (
                              <button
                                onClick={() => handleStatusChange(grievance.id, 'in_progress')}
                                disabled={updatingId === grievance.id}
                                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50"
                              >
                                Start
                              </button>
                            )}
                            {grievance.status !== 'resolved' && (
                              <button
                                onClick={() => handleStatusChange(grievance.id, 'resolved')}
                                disabled={updatingId === grievance.id}
                                className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 disabled:opacity-50"
                              >
                                Resolve
                              </button>
                            )}
                            {grievance.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusChange(grievance.id, 'rejected')}
                                disabled={updatingId === grievance.id}
                                className="px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
