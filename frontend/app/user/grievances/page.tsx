'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { grievanceAPI } from '@/lib/api';
import { Grievance, GrievanceResponse, DEPARTMENT_MAP, STATUS_DISPLAY, PRIORITY_DISPLAY, DepartmentId, Priority, GrievanceStatus } from '@/types';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function UserGrievancesPage() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadGrievances();
  }, [statusFilter]);

  const loadGrievances = async () => {
    try {
      setLoading(true);
      const data = await grievanceAPI.getMyGrievances(0, 100);
      const filtered = statusFilter 
        ? data.filter(g => g.status === statusFilter)
        : data;
      setGrievances(filtered);
    } catch (err: any) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoading(false);
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

  const stats = {
    total: grievances.length,
    submitted: grievances.filter((g) => g.status === 'submitted').length,
    inProgress: grievances.filter((g) => g.status === 'in_progress').length,
    resolved: grievances.filter((g) => g.status === 'resolved').length,
    rejected: grievances.filter((g) => g.status === 'rejected').length,
  };

  return (
    <ProtectedRoute allowedRoles={['citizen']}>
      <DashboardLayout role="citizen">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-black">My Grievances</h1>
            <p className="text-gray-600 mt-1">Track all your submitted grievances</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-3xl font-bold text-black mt-2">{stats.total}</p>
                </div>
                <FileText size={32} className="text-gray-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Submitted</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.submitted}</p>
                </div>
                <Clock size={32} className="text-yellow-400" />
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
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
                </div>
                <CheckCircle size={32} className="text-green-400" />
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-gray-900"
              >
                <option value="">All</option>
                <option value="submitted">Submitted</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Grievances List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading grievances...</div>
            ) : grievances.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No grievances found. Submit your first grievance from the dashboard!
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {grievances.map((grievance) => (
                      <tr key={grievance.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{grievance.id.slice(-6)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {grievance.message}
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
