'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Grievance, DEPARTMENT_MAP, STATUS_DISPLAY, PRIORITY_DISPLAY, DepartmentId, Priority, GrievanceStatus } from '@/types';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function AdminGrievancesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadGrievances();
  }, [statusFilter]);

  const loadGrievances = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getGrievances(
        undefined,
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
      await loadGrievances();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

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
            <h1 className="text-2xl font-bold text-black">Manage Grievances</h1>
            <p className="text-gray-600 mt-1">Review and update grievance status</p>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
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


            </div>
          </div>

          {/* Grievances List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading grievances...</div>
            ) : grievances.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No grievances found matching your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {grievances.map((grievance) => (
                      <tr 
                        key={grievance.id} 
                        onClick={() => router.push(`/admin/grievances/${grievance.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{grievance.id.slice(-6)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="line-clamp-2">{grievance.message}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {DEPARTMENT_MAP[grievance.predicted_department as DepartmentId]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs border rounded-full ${getPriorityColor(grievance.priority)}`}>
                            {PRIORITY_DISPLAY[grievance.priority as Priority]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs border rounded-full ${getStatusColor(grievance.status)}`}>
                            {STATUS_DISPLAY[grievance.status as GrievanceStatus]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(grievance.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div onClick={(e) => e.stopPropagation()}>
                            {grievance.status === 'submitted' && (
                              <button
                                onClick={() => handleStatusChange(grievance.id, 'in_progress')}
                                disabled={updatingId === grievance.id}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-xs"
                              >
                                Start
                              </button>
                            )}
                            {grievance.status === 'in_progress' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStatusChange(grievance.id, 'resolved')}
                                  disabled={updatingId === grievance.id}
                                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-xs"
                                >
                                  Resolve
                                </button>
                                <button
                                  onClick={() => handleStatusChange(grievance.id, 'rejected')}
                                  disabled={updatingId === grievance.id}
                                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 text-xs"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {(grievance.status === 'resolved' || grievance.status === 'rejected') && (
                              <span className="text-gray-500 text-xs">Closed</span>
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
